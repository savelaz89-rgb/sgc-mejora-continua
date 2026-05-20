import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileDown, Pencil } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ActionFormDialog } from "./ActionFormDialog";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import { fmtDate, isOverdue, priorityBadgeClass, statusBadgeClass, riskColor } from "@/lib/format";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  type: "correctiva" | "preventiva" | "mejora";
  title: string;
}

export function ActionsTable({ type, title }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [risks, setRisks] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<string>("todas");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("actions").select("*").eq("type", type).order("created_at", { ascending: false });
    setRows(data ?? []);
    const { data: pr } = await supabase.from("profiles").select("id, full_name, email");
    const map: Record<string, string> = {};
    (pr ?? []).forEach((p) => (map[p.id] = p.full_name || p.email));
    setProfiles(map);
    if (type === "preventiva") {
      const { data: rk } = await supabase.from("risk_matrix").select("action_id, risk_level");
      const r: Record<string, number> = {};
      (rk ?? []).forEach((x) => (r[x.action_id] = x.risk_level));
      setRisks(r);
    }
  };

  useEffect(() => { load(); }, [type]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusF !== "todas" && r.status !== statusF) return false;
      if (q && !`${r.code} ${r.title} ${r.area}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, statusF]);

  const exportCSV = () => {
    const headers = ["Código", "Título", "Origen", "Área", "Responsable", "Vence", "Estado", "Prioridad"];
    const lines = [headers.join(",")];
    filtered.forEach((r) => {
      lines.push([r.code, `"${r.title.replace(/"/g, '""')}"`, r.source, r.area ?? "", profiles[r.detected_by] ?? "", r.due_date ?? "", r.status, r.priority].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} resultado(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportCSV}><FileDown className="size-4 mr-1" /> Exportar CSV</Button>
          <Button variant="outline" onClick={() => window.print()}><FileDown className="size-4 mr-1" /> PDF</Button>
          <Button onClick={() => { setEditId(null); setOpen(true); }}><Plus className="size-4 mr-1" /> Nueva</Button>
        </div>
      </div>

      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-60">
          <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar por código, título o área..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="abierta">Abierta</SelectItem>
            <SelectItem value="en_proceso">En proceso</SelectItem>
            <SelectItem value="cerrada">Cerrada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Vence</TableHead>
              {type === "preventiva" && <TableHead>Riesgo</TableHead>}
              {type === "mejora" && <TableHead>Beneficio</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  No hay acciones registradas todavía.
                </TableCell>
              </TableRow>
            ) : filtered.map((r) => {
              const overdue = isOverdue(r.due_date, r.status);
              const effectiveStatus = overdue ? "vencida" : r.status;
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Link to="/acciones/$id" params={{ id: r.id }} className="hover:underline font-medium">{r.title}</Link>
                  </TableCell>
                  <TableCell className="capitalize text-xs">{r.source}</TableCell>
                  <TableCell>{r.area ?? "—"}</TableCell>
                  <TableCell className="text-xs">{profiles[r.detected_by] ?? "—"}</TableCell>
                  <TableCell className="text-xs">{fmtDate(r.due_date)}</TableCell>
                  {type === "preventiva" && (
                    <TableCell>
                      {risks[r.id] != null ? <Badge className={riskColor(risks[r.id])}>{risks[r.id]}</Badge> : "—"}
                    </TableCell>
                  )}
                  {type === "mejora" && (
                    <TableCell className="text-xs max-w-[180px] truncate">{r.expected_benefit ?? "—"}</TableCell>
                  )}
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusBadgeClass(effectiveStatus)}`}>
                      {STATUS_LABEL[effectiveStatus]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityBadgeClass(r.priority)}>{PRIORITY_LABEL[r.priority]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(r.id); setOpen(true); }}>
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <ActionFormDialog open={open} onOpenChange={setOpen} defaultType={type} actionId={editId} onSaved={load} />
    </div>
  );
}