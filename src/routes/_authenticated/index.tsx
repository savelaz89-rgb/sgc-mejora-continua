import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { fmtDate, isOverdue, statusBadgeClass } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/")({ component: Dashboard });

const COLORS = ["hsl(220 90% 56%)", "hsl(160 70% 45%)", "hsl(30 95% 55%)", "hsl(340 80% 55%)", "hsl(265 70% 60%)", "hsl(200 80% 50%)"];

function Dashboard() {
  const [actions, setActions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [verif, setVerif] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("actions").select("*").then(({ data }) => setActions(data ?? []));
    supabase.from("profiles").select("id, full_name, email").then(({ data }) => {
      const m: Record<string, string> = {};
      (data ?? []).forEach((p) => (m[p.id] = p.full_name || p.email));
      setProfiles(m);
    });
    supabase.from("effectiveness_verification").select("*").then(({ data }) => setVerif(data ?? []));
  }, []);

  const today = new Date();
  const openCount = actions.filter((a) => a.status !== "cerrada").length;
  const overdueList = actions.filter((a) => isOverdue(a.due_date, a.status));
  const closedThisMonth = actions.filter((a) => {
    if (a.status !== "cerrada") return false;
    const d = new Date(a.updated_at);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  const effective = verif.filter((v) => v.result === "eficaz").length;
  const closed = actions.filter((a) => a.status === "cerrada").length;
  const effectivenessRate = closed ? Math.round((effective / closed) * 100) : 0;

  const avgClosingDays = (() => {
    const closedActs = actions.filter((a) => a.status === "cerrada" && a.detection_date);
    if (!closedActs.length) return 0;
    const total = closedActs.reduce((s, a) => s + Math.max(0, Math.round((new Date(a.updated_at).getTime() - new Date(a.detection_date).getTime()) / 86400000)), 0);
    return Math.round(total / closedActs.length);
  })();

  const recurrenceRate = verif.length ? Math.round((verif.filter((v) => v.recurrence).length / verif.length) * 100) : 0;
  const overduePct = actions.length ? Math.round((overdueList.length / actions.length) * 100) : 0;

  const byStatus = ["abierta", "en_proceso", "cerrada"].map((s) => ({
    name: STATUS_LABEL[s],
    value: actions.filter((a) => a.status === s).length,
  }));

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("es-ES", { month: "short" }) };
  });
  const byMonth = monthLabels.map((m) => ({
    name: m.label,
    valor: actions.filter((a) => {
      const d = new Date(a.detection_date);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).length,
  }));

  const sourceMap: Record<string, number> = {};
  actions.forEach((a) => { sourceMap[a.source] = (sourceMap[a.source] ?? 0) + 1; });
  const bySource = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const typeMap: Record<string, number> = {};
  actions.forEach((a) => { typeMap[a.type] = (typeMap[a.type] ?? 0) + 1; });
  const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Indicadores clave del Sistema de Gestión de Calidad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={AlertTriangle} label="Acciones abiertas" value={openCount} color="text-primary" />
        <Kpi icon={Clock} label="Vencidas" value={overdueList.length} color="text-destructive" sub={`${overduePct}% del total`} />
        <Kpi icon={CheckCircle2} label="Cerradas este mes" value={closedThisMonth} color="text-success" />
        <Kpi icon={TrendingUp} label="Eficacia" value={`${effectivenessRate}%`} color="text-info" sub="Meta ≥ 85%" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Tiempo promedio de cierre" value={`${avgClosingDays}d`} sub="Meta ≤ 30 días" />
        <Kpi label="Tasa de recurrencia" value={`${recurrenceRate}%`} sub="Meta ≤ 10%" />
        <Kpi label="Total acciones" value={actions.length} />
        <Kpi label="Verificaciones realizadas" value={verif.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Acciones por estado</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(220 90% 56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Tendencia mensual de NC</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="hsl(220 90% 56%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Distribución por origen</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Distribución por tipo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Top 5 acciones vencidas</h3>
        {overdueList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay acciones vencidas. ¡Bien hecho!</p>
        ) : (
          <div className="space-y-2">
            {overdueList.slice(0, 5).map((a) => (
              <Link key={a.id} to="/acciones/$id" params={{ id: a.id }} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent">
                <div>
                  <div className="font-medium text-sm">{a.code} — {a.title}</div>
                  <div className="text-xs text-muted-foreground">Responsable: {profiles[a.detected_by] ?? "—"} · Vence: {fmtDate(a.due_date)}</div>
                </div>
                <Badge className={statusBadgeClass("vencida")}>Vencida</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color, sub }: { icon?: any; label: string; value: any; color?: string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {Icon && <Icon className={`size-6 ${color ?? "text-muted-foreground"}`} />}
      </div>
    </Card>
  );
}