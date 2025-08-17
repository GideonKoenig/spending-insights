### Arbeitsanweisung: Neues CSV-Format hinzufügen

Diese Anleitung beschreibt den vollständigen Ablauf von der Analyse eines neuen Export-Formats bis zur Implementierung und Registrierung im System.

---

## 1) Analyse: Kopfzeilen und Spalten verstehen

- **Headers erfassen**: Öffne die CSV, notiere die Header exakt inklusive Groß-/Kleinschreibung, Leerzeichen, Sonderzeichen. Unsere Format-Erkennung erwartet eine exakte Übereinstimmung der Header-Liste und -Anzahl.
- **Datumsfelder**: Identifiziere Buchungs- und Valutadatum. Prüfe das Datumsformat:
  - dd.mm.yyyy → nutze `parseDate` aus `@/lib/data-injestion/utils`.
  - dd/mm/yyyy oder mm/dd/yyyy → implementiere eine lokale Parser-Funktion im Format (Beispiel siehe `wespac.ts`).
- **Betragsfelder**: Finde die Spalten für Betrag. Varianten:
  - Eine Spalte mit Vorzeichen oder Soll/Haben-Spalte.
  - Separate Spalten für Kredit/Debit → berechne Nettobetrag: `amount = credit - debit`.
  - `parseAmount` erkennt Vorzeichen und entfernt Tausender-/Dezimaltrennzeichen robust.
  - Vermeide Schema-Defaults für optionale Betragsfelder. Wenn genau eine der Spalten gefüllt ist (z. B. `Credit` XOR `Debit`), erzwinge die XOR-Logik im Mapping (oder via Schema-Refine nur wenn kompatibel) und berechne den Betrag entsprechend.
- **Währung**: Prüfe, ob eine Währungsspalte existiert. Wenn nein, setze eine passende Konstante (z. B. "EUR", "USD", "AUD").
- **Saldo**: Prüfe, ob eine Spalte wie "Saldo nach Buchung"/"Balance" existiert. Falls ja, nutze diese für `balanceAfterTransaction`. Falls nein, berechne einen **laufenden Saldo** ab 0, nachdem die Transaktionen aufsteigend nach `bookingDate` sortiert wurden.
  - Wenn der Export garantiert einen Saldo enthält, setze diesen als Pflichtfeld im Schema (kein Default) und nutze ihn direkt.
- **Gegenpartei**: Suche Felder für Name/IBAN/BIC.
  - Falls nur Kto/BLZ vorhanden, generiere IBAN mit `calculateIban(konto, blz)`.
  - Wenn keine Informationen: Felder leer lassen.
- **Transaktionstyp und Verwendungszweck**:
  - üblich: `Buchungstext`/`Umsatztyp` → `transactionType`
  - `Verwendungszweck` → `purpose`
  - Fehlen diese, leite `transactionType` aus der Richtung des Betrags ab ("credit"/"debit") und stelle `purpose` aus Beschreibung/Kategorie/Status zusammen.
- **Kategorien/Status/Bemerkungen**: Wenn vorhanden, derzeit nicht als eigene Kategorie importieren. Entweder ignorieren oder als Zusatzhinweis in `purpose` beibehalten (siehe `mint.ts`/`wespac.ts`/`arvest.ts`).
- **Zeilenvalidierung**: Überspringe unvollständige/irrelevante Zeilen (z. B. komplett leere, Summen, Header-Wiederholungen, 0-Betrag ohne Inhalt).

Interne Zielschnittstelle: `@/lib/types.Transaction` (ohne `hash` beim Mapping):
- `bookingDate: Date`
- `valueDate: Date`
- `participantName: string`
- `participantIban?: string`
- `participantBic?: string`
- `transactionType: string`
- `purpose: string`
- `amount: number`
- `currency: string`
- `balanceAfterTransaction: number`

---

## 2) Quelle identifizieren (Recherche)

- Prüfe Header-Sprache und typische Begriffe:
  - Deutsch: „Buchungstag“, „Valuta“, „Begünstigter/Zahlungspflichtiger“, „Umsatz in EUR“, „Saldo nach Buchung“, „BLZ/Kontonummer“.
  - Englisch: „Date“, „Description/Narrative“, „Debit/Credit Amount“, „Balance“, „Category“.
- Suche im Web nach exakten Header-Begriffen in Anführungszeichen. Häufig lassen sich Bank, Portal oder App so zuordnen.
- Prüfe Metadaten/Banknamen im Export (z. B. `Bankname Auftragskonto` in `standard-format-3.ts`).
- Wenn die Bank bereits existiert, aber die Header abweichen, lege eine zweite Variante an: `bank-2`.
- Kannst du die Quelle nicht sicher bestimmen, verwende `unspecified-N`.

---

## 3) Benennung und Datei anlegen

- Dateiname: `bank-originkebab.ts` (z. B. `dkb.ts`, `comdirect.ts`, `sparkasse.ts`, `mint.ts`, `wespac.ts`). Varianten: `dkb-2.ts`.
- Export-Objekt:
  - `name`: kebab-case, eindeutig (z. B. `dkb`, `dkb-2`).
  - `displayName`: Nutzerfreundlicher Name (z. B. "DKB").
  - `note`: siehe Abschnitt „Note-Leitfaden“.
- Imports immer per Alias `@/*` (keine relativen Imports).

---

## 4) Schema definieren (Zod)

- Definiere das Schema exakt mit den CSV-Headern als Keys. Beispiel:

```ts
import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const MyBankSchema = z.object({
  Buchungstag: z.string(),
  Valuta: z.string(),
  "Buchungstext": z.string(),
  "Verwendungszweck": z.string(),
  Betrag: z.string(),
  Währung: z.string(),
});
```

Hinweis: Die Format-Erkennung vergleicht die Menge und Anzahl der Keys 1:1 mit der Headerzeile.

---

## 5) Mapping implementieren

Grundmuster (siehe `ing.ts`, `dkb.ts`, `sparkasse.ts`, `comdirect.ts`, `commerzbank.ts`, `standard-format-*.ts`, `mint.ts`, `wespac.ts`, `arvest.ts`):

```ts
function map(elements: z.infer<typeof MyBankSchema>[]) {
  const result: Omit<Transaction, "hash">[] = [];
  for (const element of elements) {
    const amount = parseAmount(element["Betrag"]);

    const tx: Omit<Transaction, "hash"> = {
      bookingDate: parseDate(element["Buchungstag"]),
      valueDate: parseDate(element["Valuta"]),
      participantName: "", // aus Feldern ableiten oder leer
      participantIban: "",
      participantBic: "",
      transactionType: element["Buchungstext"],
      purpose: element["Verwendungszweck"],
      amount,
      currency: element["Währung"],
      balanceAfterTransaction: 0, // ggf. später berechnen oder direkt aus CSV
    };
    result.push(tx);
  }

  // Falls CSV keinen Saldo enthält: chronologisch sortieren und laufenden Saldo berechnen
  result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());
  let running = 0;
  for (const tx of result) {
    running += tx.amount;
    tx.balanceAfterTransaction = running;
  }
  return result;
}
```

Varianten:
- Separate `Credit/Debit`-Spalten → `amount = credit - debit` (siehe `wespac.ts`, `arvest.ts`).
- Datum mit „/“ → lokale `parseDateSlash` nutzen (siehe `wespac.ts`).
- IBAN aus Konto/BLZ → `calculateIban` nutzen (siehe `sparkasse.ts`).
- Typ oder Purpose zusammensetzen → Beispiel `mint.ts`, `arvest.ts`.

---

## 6) Bankname ermitteln

- Statisch zurückgeben (z. B. `return "DKB";`).
- Oder aus Daten lesen, wenn vorhanden (z. B. `standard-format-3.ts`).

```ts
function getBankName(elements: z.infer<typeof MyBankSchema>[]) {
  return "My Bank";
}
```

---

## 7) Note-Leitfaden (Konsistente Wortwahl)

- Kein Saldo im Export:
  - „<Bank> does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.“
- Saldo im Export vorhanden:
  - „<Bank> CSV export format includes the account balance after each transaction, which we preserve as provided.“
- Kategorien vorhanden, aktuell ungenutzt:
  - „<Bank> CSV export format includes information about the category of a transaction, which is currently not utilized. Future update will include the ability to preserve those hints.“
- Status/Pending vorhanden (optional): Hinweis ergänzen wie in `arvest.ts`/`mint.ts`.

Richte die Note inhaltlich nach den vorhandenen Spalten aus und nutze die obigen Textbausteine als Grundlage.

---

## 8) Registrierung (zwingender Schritt)

1. Datei in diesem Ordner anlegen und Export erstellen:
   - `export const MyBank: DataInjestFormat<typeof MyBankSchema> = { ... }`
2. In `@/lib/data-injestion/main.ts` importieren und in `MAPPING_REGISTRY` hinzufügen.
   - Reihenfolge: erst bank-spezifische Formate, dann generische `standard-format-*`, dann `unspecified-*`.
3. Prüfen, dass Import-Pfad und `name` eindeutig sind und im UI korrekt angezeigt werden.

Die Erkennung (`findFormat`) verlangt exakte Header-Mengen inkl. gleicher Länge. Bei optionalen Spalten entstehen ggf. Varianten (siehe „Varianten-Namen“).

---

## 9) Varianten-Namen und Datei-Regel

- Bereits vorhandene Bank mit anderem Header-Set: `bank-2`, `bank-3`, ...
- Unklare Herkunft: `unspecified-1`, `unspecified-2`, ...
- `displayName` bleibt bei Varianten in der Regel identisch (z. B. „DKB“). `name` ist eindeutig.

Hinweis: Eine Datei enthält genau ein Format-Export. Für Varianten wird eine eigene Datei angelegt (z. B. `ing.ts` und `ing-2.ts`). Das hält Änderungen klein und die Format-Erkennung übersichtlich.

---

## 10) Vorlage (Skelett)

```ts
import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const MyBankSchema = z.object({
  // Header exakt übernehmen
});

function map(elements: z.infer<typeof MyBankSchema>[]) {
  const result: Omit<Transaction, "hash">[] = [];
  for (const e of elements) {
    const amount = parseAmount("");
    const tx: Omit<Transaction, "hash"> = {
      bookingDate: parseDate(""),
      valueDate: parseDate(""),
      participantName: "",
      participantIban: "",
      participantBic: "",
      transactionType: "",
      purpose: "",
      amount,
      currency: "EUR",
      balanceAfterTransaction: 0,
    };
    result.push(tx);
  }
  result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());
  let running = 0;
  for (const tx of result) {
    running += tx.amount;
    tx.balanceAfterTransaction = running;
  }
  return result;
}

function getBankName() {
  return "My Bank";
}

export const MyBank: DataInjestFormat<typeof MyBankSchema> = {
  name: "my-bank",
  displayName: "My Bank",
  schema: MyBankSchema,
  map,
  getBankName,
  note: "My Bank does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
```

---

## 11) Hinweise

- Verwende ausschließlich Alias-Imports (`@/*`).
- Füge keine Kommentare in Code ein, die Offensichtliches erklären. Halte die Implementierung klar und direkt.
- Bewahre Zusatzinfos (Kategorien, Status) in `purpose` auf, bis die native Kategorie-Übernahme vorgesehen ist.
- Für neue Datumsformate nutze eine lokale Parser-Funktion, ändere `parseDate` nicht global.


