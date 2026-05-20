import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PROCESOS, AREAS, SOURCES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, ShieldAlert, Lightbulb } from "lucide-react";
import { riskColor, riskLabel } from "@/lib/format";

type Type = "correctiva" | "preventiva" | "mejora";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultType?: Type;
  actionId?: string | null;
  onSaved?: () => void;
}

interface Task {
  id?: string;
  task_description: string;
  responsible: string | null;
  due_date: string | null;
  status: "pendiente" | "en_proceso" | "completada";
}

export function ActionFormDialog({ open, onOpenChange, defaultType = "correctiva", actionId, onSaved }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string | null; email: string }[]>([]);

  // Tab 1
  const [type, setType] = useState<Type>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("auditoria");
  const [process, setProcess] = useState("");
  const [area, setArea] = useState("");
  const [detectedBy, setDetectedBy] = useState<string>("");
  const [detectionDate, setDetectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");
  const [expectedBenefit, setExpectedBenefit] = useState("");

  // risk
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);

  // Tab 2 RCA
  const [method, setMethod] = useState<"5_porques" | "ishikawa" | "8d">("5_porques");
  const [whys, setWhys] = useState(["", "", "", "", ""]);
  const [rootCause, setRootCause] = useState("");
  const [fishbone, setFishbone] = useState<Record<string, string>>({
    Maquina: "",
    "Mano de obra": "",
    Metodo: "",
    Material: "",
    "Medio ambiente": "",
    Medicion: "",
  });

  // Tab 3 tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // Tab 4 verification
  const [verifiedBy, setVerifiedBy] = useState<string>("");
  const [verificationDate, setVerificationDate] = useState("");
  const [result, setResult] = useState<"eficaz" | "no_eficaz" | "">("");
  const [comments, setComments] = useState("");
  const [recurrence, setRecurrence] = useState(false);

  const [code, setCode] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setTab("general");
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .then(({ data }) => setProfiles(data ?? []));
    if (actionId) loadAction(actionId);
    else resetForm();
  }, [open, actionId, defaultType]);

  const resetForm = () => {
    setCode("");
    setTitle("");
    setDescription("");
    setSource("auditoria");
    setProcess("");
    setArea("");
    setDetectedBy(user?.id ?? "");
    setDetectionDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setPriority("media");
    setExpectedBenefit("");
    setProbability(3);
    setImpact(3);
    setMethod("5_porques");
    setWhys(["", "", "", "", ""]);
    setRootCause("");
    setFishbone({
      Maquina: "",
      "Mano de obra": "",
      Metodo: "",
      Material: "",
      "Medio ambiente": "",
      Medicion: "",
    });
    setTasks([]);
    setVerifiedBy("");
    setVerificationDate("");
    setResult("");
    setComments("");
    setRecurrence(false);
  };

  const loadAction = async (id: string) => {
    const { data: a } = await supabase.from("actions").select("*").eq("id", id).single();
    if (!a) return;
    setType(a.type as Type);
    setCode(a.code);
    setTitle(a.title);
    setDescription(a.description);
    setSource(a.source);
    setProcess(a.process ?? "");
    setArea(a.area ?? "");
    setDetectedBy(a.detected_by ?? "");
    setDetectionDate(a.detection_date);
    setDueDate(a.due_date ?? "");
    setPriority(a.priority);
    setExpectedBenefit(a.expected_benefit ?? "");

    const { data: rca } = await supabase.from("root_cause_analysis").select("*").eq("action_id", id).maybeSingle();
    if (rca) {
      setMethod(rca.method);
      setWhys([rca.why1 ?? "", rca.why2 ?? "", rca.why3 ?? "", rca.why4 ?? "", rca.why5 ?? ""]);
      setRootCause(rca.root_cause ?? "");
      if (rca.fishbone_categories) setFishbone(rca.fishbone_categories as any);
    }
    const { data: rk } = await supabase.from("risk_matrix").select("*").eq("action_id", id).maybeSingle();
    if (rk) {
      setProbability(rk.probability);
      setImpact(rk.impact);
    }
    const { data: pl } = await supabase.from("action_plans").select("*").eq("action_id", id).order("created_at");
    setTasks((pl ?? []) as any);
    const { data: v } = await supabase.from("effectiveness_verification").select("*").eq("action_id", id).maybeSingle();
    if (v) {
      setVerifiedBy(v.verified_by ?? "");
      setVerificationDate(v.verification_date ?? "");
      setResult((v.result as any) ?? "");
      setComments(v.comments ?? "");
      setRecurrence(v.recurrence);
    }
  };

  const addTask = () =>
    setTasks((t) => [...t, { task_description: "", responsible: null, due_date: null, status: "pendiente" }]);

  const completedPct = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "completada").length / tasks.length) * 100)
    : 0;
  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "completada");

  const save = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Título y descripción son obligatorios");
      setTab("general");
      return;
    }
    setSaving(true);
    try {
      let id = actionId ?? null;
      let newCode = code;
      if (!id) {
        const { data: codeData } = await supabase.rpc("next_action_code", { _type: type });
        newCode = codeData as string;
      }
      const payload = {
        type,
        code: newCode,
        title,
        description,
        source: source as any,
        process,
        area,
        detected_by: detectedBy || null,
        detection_date: detectionDate,
        due_date: dueDate || null,
        priority,
        expected_benefit: type === "mejora" ? expectedBenefit : null,
        created_by: user?.id,
      };
      if (id) {
        const { error } = await supabase.from("actions").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("actions").insert(payload).select().single();
        if (error) throw error;
        id = data.id;
      }

      // RCA
      const rcaPayload = {
        action_id: id!,
        method,
        why1: whys[0], why2: whys[1], why3: whys[2], why4: whys[3], why5: whys[4],
        root_cause: rootCause,
        fishbone_categories: method === "ishikawa" ? fishbone : null,
      };
      await supabase.from("root_cause_analysis").upsert(rcaPayload, { onConflict: "action_id" });

      if (type === "preventiva") {
        await supabase.from("risk_matrix").upsert(
          { action_id: id!, probability, impact },
          { onConflict: "action_id" }
        );
      }

      // Tasks: delete all and re-insert (simple)
      await supabase.from("action_plans").delete().eq("action_id", id!);
      if (tasks.length) {
        await supabase.from("action_plans").insert(
          tasks.map((t) => ({
            action_id: id!,
            task_description: t.task_description,
            responsible: t.responsible,
            due_date: t.due_date,
            status: t.status,
          }))
        );
      }

      // Verification
      if (result) {
        await supabase.from("effectiveness_verification").upsert(
          {
            action_id: id!,
            verified_by: verifiedBy || null,
            verification_date: verificationDate || null,
            result: result as any,
            comments,
            recurrence,
            close_date: result === "eficaz" ? new Date().toISOString().slice(0, 10) : null,
          },
          { onConflict: "action_id" }
        );
        if (result === "eficaz") {
          await supabase.from("actions").update({ status: "cerrada" }).eq("id", id!);
        }
      } else {
        // Auto status
        const newStatus = allDone ? "en_proceso" : tasks.some((t) => t.status !== "pendiente") ? "en_proceso" : "abierta";
        await supabase.from("actions").update({ status: newStatus }).eq("id", id!);
      }

      await supabase.from("activity_log").insert({
        action_id: id!,
        user_id: user?.id,
        activity: actionId ? "Acción actualizada" : `Acción ${newCode} creada`,
      });

      toast.success("Guardado correctamente");
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const typeIcon = { correctiva: AlertTriangle, preventiva: ShieldAlert, mejora: Lightbulb }[type];
  const TypeIcon = typeIcon;
  const riskLevel = probability * impact;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="size-5" />
            {actionId ? "Editar" : "Nueva"} acción {type}
            {code && <Badge variant="secondary">{code}</Badge>}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">1. General</TabsTrigger>
            <TabsTrigger value="causa">2. Causa Raíz</TabsTrigger>
            <TabsTrigger value="plan">3. Plan de Acción</TabsTrigger>
            <TabsTrigger value="verif" disabled={!allDone}>4. Verificación</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {!actionId && (
              <div className="grid grid-cols-3 gap-3">
                {(["correctiva", "preventiva", "mejora"] as const).map((t) => {
                  const Icon = { correctiva: AlertTriangle, preventiva: ShieldAlert, mejora: Lightbulb }[t];
                  return (
                    <Card
                      key={t}
                      onClick={() => setType(t)}
                      className={`p-4 cursor-pointer text-center transition ${
                        type === t ? "border-primary ring-2 ring-primary/30" : ""
                      }`}
                    >
                      <Icon className="size-6 mx-auto mb-1 text-primary" />
                      <div className="text-sm font-medium capitalize">{t}</div>
                    </Card>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Descripción *</Label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Origen</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Proceso</Label>
                <Select value={process} onValueChange={setProcess}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    {PROCESOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Área</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Detectado por</Label>
                <Select value={detectedBy} onValueChange={setDetectedBy}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de detección</Label>
                <Input type="date" value={detectionDate} onChange={(e) => setDetectionDate(e.target.value)} />
              </div>
              <div>
                <Label>Fecha límite</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Prioridad</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["alta", "media", "baja"] as const).map((p) => (
                    <Card
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`p-3 text-center cursor-pointer capitalize ${
                        priority === p ? "border-primary ring-2 ring-primary/30" : ""
                      }`}
                    >
                      {p}
                    </Card>
                  ))}
                </div>
              </div>
              {type === "mejora" && (
                <div className="col-span-2">
                  <Label>Beneficio esperado</Label>
                  <Textarea rows={2} value={expectedBenefit} onChange={(e) => setExpectedBenefit(e.target.value)} />
                </div>
              )}
              {type === "preventiva" && (
                <div className="col-span-2 p-4 rounded-md bg-secondary space-y-3">
                  <div className="font-medium text-sm">Matriz de Riesgo</div>
                  <div>
                    <Label className="text-xs">Probabilidad: {probability}</Label>
                    <Slider value={[probability]} min={1} max={5} step={1} onValueChange={(v) => setProbability(v[0])} />
                  </div>
                  <div>
                    <Label className="text-xs">Impacto: {impact}</Label>
                    <Slider value={[impact]} min={1} max={5} step={1} onValueChange={(v) => setImpact(v[0])} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Nivel de riesgo:</span>
                    <Badge className={riskColor(riskLevel)}>{riskLevel} - {riskLabel(riskLevel)}</Badge>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="causa" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-2">
              {(["5_porques", "ishikawa", "8d"] as const).map((m) => (
                <Card key={m} onClick={() => setMethod(m)} className={`p-3 text-center cursor-pointer text-sm ${method === m ? "border-primary ring-2 ring-primary/30" : ""}`}>
                  {m === "5_porques" ? "5 Porqués" : m === "ishikawa" ? "Ishikawa" : "8D"}
                </Card>
              ))}
            </div>

            {method === "5_porques" && (
              <div className="space-y-2">
                {whys.map((w, i) => (
                  <div key={i}>
                    <Label>¿Por qué {i + 1}?</Label>
                    <Input value={w} onChange={(e) => setWhys((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} />
                  </div>
                ))}
              </div>
            )}
            {method === "ishikawa" && (
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(fishbone).map((k) => (
                  <div key={k}>
                    <Label>{k}</Label>
                    <Textarea rows={2} value={fishbone[k]} onChange={(e) => setFishbone((f) => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            )}
            {method === "8d" && (
              <Textarea rows={6} placeholder="D1-D8: descripción detallada de cada disciplina" value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            )}

            <div>
              <Label>{type === "preventiva" ? "Descripción del riesgo" : "Causa raíz final"}</Label>
              <Textarea rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="plan" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Tareas ({tasks.filter((t) => t.status === "completada").length}/{tasks.length})</div>
                <Progress value={completedPct} className="w-64 mt-1" />
              </div>
              <Button onClick={addTask} size="sm"><Plus className="size-4 mr-1" /> Agregar Tarea</Button>
            </div>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <Card key={i} className="p-3 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label className="text-xs">Descripción</Label>
                    <Input value={t.task_description} onChange={(e) => setTasks((arr) => arr.map((x, j) => j === i ? { ...x, task_description: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Responsable</Label>
                    <Select value={t.responsible ?? ""} onValueChange={(v) => setTasks((arr) => arr.map((x, j) => j === i ? { ...x, responsible: v } : x))}>
                      <SelectTrigger><SelectValue placeholder="Asignar" /></SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Vence</Label>
                    <Input type="date" value={t.due_date ?? ""} onChange={(e) => setTasks((arr) => arr.map((x, j) => j === i ? { ...x, due_date: e.target.value } : x))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Estado</Label>
                    <Select value={t.status} onValueChange={(v) => setTasks((arr) => arr.map((x, j) => j === i ? { ...x, status: v as any } : x))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_proceso">En proceso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setTasks((arr) => arr.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
                </Card>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aún no hay tareas. Agregue la primera.</p>}
            </div>
          </TabsContent>

          <TabsContent value="verif" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Verificado por</Label>
                <Select value={verifiedBy} onValueChange={setVerifiedBy}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de verificación</Label>
                <Input type="date" value={verificationDate} onChange={(e) => setVerificationDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Resultado</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Card onClick={() => setResult("eficaz")} className={`p-3 text-center cursor-pointer ${result === "eficaz" ? "border-success ring-2 ring-success/30 bg-success/5" : ""}`}>Eficaz</Card>
                  <Card onClick={() => setResult("no_eficaz")} className={`p-3 text-center cursor-pointer ${result === "no_eficaz" ? "border-destructive ring-2 ring-destructive/30 bg-destructive/5" : ""}`}>No Eficaz</Card>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Comentarios</Label>
                <Textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox id="rec" checked={recurrence} onCheckedChange={(v) => setRecurrence(!!v)} />
                <Label htmlFor="rec">La no conformidad se ha repetido</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}