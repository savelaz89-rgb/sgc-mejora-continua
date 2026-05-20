import { createFileRoute } from "@tanstack/react-router";
import { ActionsTable } from "@/components/ActionsTable";
export const Route = createFileRoute("/_authenticated/acciones-preventivas")({
  component: () => <ActionsTable type="preventiva" title="Acciones Preventivas" />,
});