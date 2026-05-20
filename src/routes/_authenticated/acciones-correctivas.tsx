import { createFileRoute } from "@tanstack/react-router";
import { ActionsTable } from "@/components/ActionsTable";
export const Route = createFileRoute("/_authenticated/acciones-correctivas")({
  component: () => <ActionsTable type="correctiva" title="Acciones Correctivas" />,
});