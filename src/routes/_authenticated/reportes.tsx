import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reportes")({ component: Reports });

function Reports() {
  const [actions, setActions] = useState<any[]>([]);
  useEffect(() => { supabase.from("actions").select("*").then(({ data }) => setActions(data ?? [])); }, []);

  const byArea: Record<string, number> = {};
  actions.forEach((a) => { const k = a.area ?? "Sin área"; byArea[k] = (byArea[k] ?? 0) + 1; });
  const dataArea = Object.entries(byArea).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Análisis y estadísticas del SGC</p>
        </div>
        <Button onClick={() => window.print()}><Printer className="size-4 mr-1" /> Exportar PDF</Button>
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Acciones por área</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataArea}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(220 90% 56%)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Resumen general</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-muted-foreground">Total</p><p className="text-2xl font-bold">{actions.length}</p></div>
          <div><p className="text-muted-foreground">Abiertas</p><p className="text-2xl font-bold">{actions.filter(a => a.status === "abierta").length}</p></div>
          <div><p className="text-muted-foreground">En proceso</p><p className="text-2xl font-bold">{actions.filter(a => a.status === "en_proceso").length}</p></div>
          <div><p className="text-muted-foreground">Cerradas</p><p className="text-2xl font-bold">{actions.filter(a => a.status === "cerrada").length}</p></div>
        </div>
      </Card>
    </div>
  );
}