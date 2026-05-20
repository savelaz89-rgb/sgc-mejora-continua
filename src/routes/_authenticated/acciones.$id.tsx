import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionFormDialog } from "@/components/ActionFormDialog";
import { fmtDate, statusBadgeClass, priorityBadgeClass } from "@/lib/format";
import { STATUS_LABEL, PRIORITY_LABEL, TYPE_LABEL } from "@/lib/constants";
import { ArrowLeft, Pencil, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/acciones/$id")({ component: Detail });

function Detail() {
  const { id } = useParams({ from: "/_authenticated/acciones/$id" });
  const [a, setA] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [rca, setRca] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("actions").select("*").eq("id", id).maybeSingle();
    setA(data);
    const { data: t } = await supabase.from("action_plans").select("*").eq("action_id", id);
    setTasks(t ?? []);
    const { data: l } = await supabase.from("activity_log").select("*").eq("action_id", id).order("created_at", { ascending: false });
    setLog(l ?? []);
    const { data: r } = await supabase.from("root_cause_analysis").select("*").eq("action_id", id).maybeSingle();
    setRca(r);
  };
  useEffect(() => { load(); }, [id]);

  if (!a) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/acciones-correctivas" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-4 mr-1" /> Imprimir</Button>
          <Button onClick={() => setOpen(true)}><Pencil className="size-4 mr-1" /> Editar</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{a.code}</Badge>
              <Badge>{TYPE_LABEL[a.type]}</Badge>
              <span className={`px-2 py-1 rounded-md text-xs ${statusBadgeClass(a.status)}`}>{STATUS_LABEL[a.status]}</span>
              <Badge className={priorityBadgeClass(a.priority)}>{PRIORITY_LABEL[a.priority]}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{a.title}</h1>
            <p className="text-muted-foreground mt-2">{a.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <Info label="Origen" value={a.source} />
          <Info label="Proceso" value={a.process} />
          <Info label="Área" value={a.area} />
          <Info label="Detectado" value={fmtDate(a.detection_date)} />
          <Info label="Vence" value={fmtDate(a.due_date)} />
        </div>
      </Card>

      {rca && (
        <Card className="p-6">
          <h2 className="font-semibold mb-3">Análisis de Causa Raíz</h2>
          <p className="text-sm text-muted-foreground mb-2">Método: {rca.method}</p>
          {rca.root_cause && <p className="text-sm"><strong>Causa raíz:</strong> {rca.root_cause}</p>}
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Plan de acción ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin tareas</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex justify-between border-b pb-2 text-sm">
                <span>{t.task_description}</span>
                <span className="text-muted-foreground">{t.status} · {fmtDate(t.due_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Historial</h2>
        {log.length === 0 ? <p className="text-sm text-muted-foreground">Sin actividad</p> : (
          <ul className="space-y-2 text-sm">
            {log.map((l) => (
              <li key={l.id} className="flex justify-between border-b pb-2">
                <span>{l.activity}</span>
                <span className="text-muted-foreground">{fmtDate(l.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ActionFormDialog open={open} onOpenChange={setOpen} defaultType={a.type} actionId={id} onSaved={load} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value ?? "—"}</p>
    </div>
  );
}