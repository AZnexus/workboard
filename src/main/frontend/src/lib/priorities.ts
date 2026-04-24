export const PRIORITY_CONFIG: Record<number, { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string }> = {
  1: { label: "Immediata", bgClass: "bg-data-negative/15", textClass: "text-data-negative", borderClass: "border-data-negative/30", dotClass: "bg-data-negative" },
  2: { label: "Urgent", bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30", dotClass: "bg-data-warning" },
  3: { label: "Alta", bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30", dotClass: "bg-data-warning" },
  4: { label: "Normal", bgClass: "bg-data-info/15", textClass: "text-data-info", borderClass: "border-data-info/30", dotClass: "bg-data-info" },
  5: { label: "Baixa", bgClass: "bg-data-neutral/15", textClass: "text-data-neutral", borderClass: "border-data-neutral/30", dotClass: "bg-data-neutral" },
}
