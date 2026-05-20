export const PROCESOS = [
  "Compras",
  "Producción",
  "Ventas",
  "RRHH",
  "Calidad",
  "Logística",
  "Mantenimiento",
  "Dirección",
];

export const AREAS = [
  "Operaciones",
  "Comercial",
  "Administración",
  "Calidad",
  "RRHH",
  "Producción",
  "Logística",
];

export const SOURCES: { value: string; label: string }[] = [
  { value: "auditoria", label: "Auditoría Interna" },
  { value: "cliente", label: "Queja de Cliente" },
  { value: "inspeccion", label: "Inspección" },
  { value: "proceso", label: "Proceso Interno" },
  { value: "direccion", label: "Revisión por la Dirección" },
  { value: "riesgo", label: "Riesgo Identificado" },
];

export const STATUS_LABEL: Record<string, string> = {
  abierta: "Abierta",
  en_proceso: "En proceso",
  cerrada: "Cerrada",
  vencida: "Vencida",
};

export const PRIORITY_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const TYPE_LABEL: Record<string, string> = {
  correctiva: "Correctiva",
  preventiva: "Preventiva",
  mejora: "Mejora",
};