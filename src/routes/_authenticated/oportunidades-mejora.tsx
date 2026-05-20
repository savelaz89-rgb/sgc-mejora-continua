import { createFileRoute } from "@tanstack/react-router";
import { ActionsTable } from "@/components/ActionsTable";
export const Route = createFileRoute("/_authenticated/oportunidades-mejora")({
  component: () => <ActionsTable type="mejora" title="Oportunidades de Mejora" />,
});