export const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const isOverdue = (due?: string | null, status?: string) =>
  !!due && status !== "cerrada" && new Date(due) < new Date(new Date().toDateString());

export const statusBadgeClass = (s: string) => {
  switch (s) {
    case "abierta":
      return "bg-destructive/10 text-destructive border border-destructive/20";
    case "en_proceso":
      return "bg-warning/15 text-warning-foreground border border-warning/30";
    case "cerrada":
      return "bg-success/15 text-success border border-success/30";
    case "vencida":
      return "bg-muted text-muted-foreground border";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const priorityBadgeClass = (p: string) => {
  switch (p) {
    case "alta":
      return "bg-destructive text-destructive-foreground";
    case "media":
      return "bg-warning text-warning-foreground";
    case "baja":
      return "bg-info text-primary-foreground";
    default:
      return "";
  }
};

export const riskColor = (level: number) => {
  if (level >= 17) return "bg-destructive text-destructive-foreground";
  if (level >= 10) return "bg-warning text-warning-foreground";
  if (level >= 5) return "bg-info text-primary-foreground";
  return "bg-success text-success-foreground";
};

export const riskLabel = (level: number) => {
  if (level >= 17) return "Crítico";
  if (level >= 10) return "Alto";
  if (level >= 5) return "Medio";
  return "Bajo";
};