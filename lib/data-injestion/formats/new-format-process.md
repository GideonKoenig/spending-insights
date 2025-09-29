### Arbeitsanweisung: Neues CSV-Format hinzufügen

Diese Anleitung beschreibt den kompakten, verbindlichen Ablauf von der Analyse eines neuen CSV-Exports bis zur Implementierung und Registrierung des Formats im System.

---

## 1) CSV analysieren (Header, Felder, Semantik)

- **Header exakt aufnehmen** (Groß-/Kleinschreibung, Leerzeichen, Sonderzeichen). Die Erkennung vergleicht Keys und Anzahl 1:1.
- **Datumsfelder** identifizieren (Buchungs-/Valutadatum) und Format prüfen:
  - Zunächst prüfen: Reicht `new Date(dateStr)` zuverlässig? Manuelle Parser nur, wenn erforderlich.
  - dd.mm.yyyy → `parseDate`
  - dd/mm/yyyy oder mm/dd/yyyy → lokale Parser-Funktion im Format (Beispiel `wespac.ts`)
- **Betrag**: eine Spalte mit Vorzeichen oder getrennte `Credit/Debit` → Nettobetrag: `amount = credit - debit`
- **Währung**: aus Spalte übernehmen; sonst konstante Währung setzen (z. B. "EUR")
- **Saldo**: vorhandenen Saldo als `balanceAfterTransaction` übernehmen; fehlt er, später laufenden Saldo berechnen
- **Gegenpartei**: Name/IBAN/BIC; wenn Kto/BLZ → IBAN via `calculateIban`
- **Transaktionstyp/Verwendungszweck**: Typ aus Feld oder Betrag-Richtung, Purpose aus Beschreibung/Kategorie/Status zusammenstellen
- **Zeilenvalidierung**: irrelevante/inkomplette Zeilen überspringen (leere, Summen, wiederholte Header, 0-Betrag ohne Inhalt)

Interne Zielschnittstelle: `@/lib/types.Transaction` (ohne `hash` während des Mappings)

---

## 2) Quelle identifizieren (Online-Recherche, falls nötig)

- Header-Sprache und typische Begriffe prüfen (de/en). 
- Exakte Header-Strings im Web suchen (in Anführungszeichen).
- Metadaten im Export prüfen (z. B. Bankname in `standard-format-3.ts`).
- Abweichungen zu bestehender Bank → Variante `bank-2`, `bank-3`, ...
- Quelle unklar → `unspecified-N`.

---

## 3) Benennung und Datei anlegen

- Dateiname: `bank-originkebab.ts` (z. B. `dkb.ts`, `sparkasse.ts`, `mint.ts`, `wespac.ts`), Varianten: `dkb-2.ts`.
- Export-Objekt: `name` (kebab, eindeutig), `displayName` (nutzerfreundlich), `note` (siehe Schritt 7).
- Immer Alias-Imports `@/*` verwenden.

---

## 4) Schema (Zod) exakt mit CSV-Headern

```ts
import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const MyBankSchema = z.object({
    // Header exakt übernehmen
});
```

Erkennung verlangt identische Key-Menge und -Anzahl.

---

## 5) Mapping implementieren

- Für jedes Element `Omit<Transaction, "hash">` erzeugen.
- Betrag berechnen (`parseAmount`; bei Credit/Debit: `credit - debit`).
- Datumsfelder parsen (`new Date(dateStr)` bevorzugen; andernfalls `parseDate` oder lokaler Parser im Format).
- Gegenpartei, Typ, Purpose ableiten; Währung setzen/übernehmen.
- Saldo: vorhanden → übernehmen; sonst nach Sortierung laufend berechnen.

Grundmuster siehe `ing-1.ts`, `dkb.ts`, `sparkasse.ts`, `comdirect.ts`, `commerzbank.ts`, `standard-format-*.ts`, `mint.ts`, `wespac.ts`, `arvest.ts`.

Wenn kein Saldo in CSV:

```ts
result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());
let running = 0;
for (const tx of result) {
    running += tx.amount;
    tx.balanceAfterTransaction = running;
}
```

---

## 6) Bankname ermitteln

- Statisch zurückgeben oder aus CSV ableiten (siehe `standard-format-3.ts`).

```ts
function getBankName() {
    return "My Bank";
}
```

---

## 7) Note verfassen (konsistente Wortwahl)

- Kein Saldo im Export:
  - "<Bank> does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually."
- Saldo vorhanden:
  - "<Bank> CSV export format includes the account balance after each transaction, which we preserve as provided."
- Kategorien/Status vorhanden, aktuell ungenutzt:
  - "<Bank> CSV export format includes information about the category of a transaction, which is currently not utilized. Future update will include the ability to preserve those hints."

Formuliere die Note passend zu den tatsächlich vorhandenen Spalten.

---

## 8) Registrierung (zwingend)

1. Format-Export in eigener Datei erstellen: `export const MyBank: DataInjestFormat<typeof MyBankSchema> = { ... }`
2. In `@/lib/data-injestion/main.ts` importieren und in `MAPPING_REGISTRY` aufnehmen.
3. Reihenfolge beachten: bank-spezifische → `standard-format-*` → `unspecified-*`.
4. Eindeutige `name`-Werte und korrekte Anzeige im UI prüfen.

---

## 9) Varianten-Regel

- Gleiche Bank, anderes Header-Set: `bank-2`, `bank-3`, ...
- Unklare Herkunft: `unspecified-1`, `unspecified-2`, ...
- `displayName` bleibt i. d. R. identisch; `name` ist eindeutig.
- Pro Datei genau ein Format-Export.

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
        const tx: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(""),
            valueDate: parseDate(""),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType: "",
            purpose: "",
            amount: parseAmount(""),
            currency: "EUR",
            balanceAfterTransaction: 0,
        };
        result.push(tx);
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

## 11) Hinweise & Qualitätscheck

- Alias-Imports (`@/*`) verwenden.
- Keine erklärenden Kommentare in Code einfügen; klare, direkte Implementierung.
- Zusatzinfos (Kategorien/Status) bis zur nativen Unterstützung im `purpose` erhalten.
- Datumsparsing: `new Date(dateStr)` zuerst prüfen; nur bei Bedarf lokale Parser nutzen; `parseDate` nicht global ändern.
- Kurztest durchführen: kleine Beispiel-CSV parsen, Erkennung, Mapping, Saldo prüfen.

---

## 12) Dokumentation aktualisieren

- README: Unter "Supported Bank Formats" neue Bank ergänzen (falls das Format eine klar benannte Bank repräsentiert).
- Guide-Seite: Liste der unterstützten Formate aktualisieren.
- Nur echte Banknamen hinzufügen (nicht für generische/unspecified Formate). Einheitliche `displayName`-Wortwahl verwenden.

---

## 13) Anonymisierte Beispielzeile im Format hinterlegen

- Die vom Benachrichtigungssystem gelieferte anonymisierte Beispielzeile samt Header als kommentierten Block am Dateianfang hinterlegen.
- Zweck: spätere Wartung, schnelle Zuordnung und Vergleich bei Varianten.
- Keine sensiblen Daten; nur das bereits anonymisierte Beispiel verwenden.