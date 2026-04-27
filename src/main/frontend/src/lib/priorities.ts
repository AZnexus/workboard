export const PRIORITY_CONFIG: Record<number, { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string }> = {
  1: { label: "Immediata", bgClass: "bg-priority-immediata/15", textClass: "text-priority-immediata", borderClass: "border-priority-immediata/30", dotClass: "bg-priority-immediata" },
  2: { label: "Urgent", bgClass: "bg-priority-urgent/15", textClass: "text-priority-urgent", borderClass: "border-priority-urgent/30", dotClass: "bg-priority-urgent" },
  3: { label: "Alta", bgClass: "bg-priority-alta/15", textClass: "text-priority-alta", borderClass: "border-priority-alta/30", dotClass: "bg-priority-alta" },
  4: { label: "Normal", bgClass: "bg-priority-normal/15", textClass: "text-priority-normal", borderClass: "border-priority-normal/30", dotClass: "bg-priority-normal" },
  5: { label: "Baixa", bgClass: "bg-priority-baixa/15", textClass: "text-priority-baixa", borderClass: "border-priority-baixa/30", dotClass: "bg-priority-baixa" },
}
