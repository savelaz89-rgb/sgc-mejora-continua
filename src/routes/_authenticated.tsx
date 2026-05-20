import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  component: Protected,
});

function Protected() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Cargando...
      </div>
    );
  }
  if (!session) return <Navigate to="/login" />;
  return <AppLayout />;
}