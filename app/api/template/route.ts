import { csvTemplate } from "@/lib/ledger/csv";

export function GET() {
  return new Response(csvTemplate, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="spending-insights-template.csv"',
    },
  });
}
