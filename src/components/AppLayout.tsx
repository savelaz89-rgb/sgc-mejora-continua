import { Link, useRouterState, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  FileBarChart2,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/acciones-correctivas", label: "Acciones Correctivas", icon: AlertTriangle },
  { to: "/acciones-preventivas", label: "Acciones Preventivas", icon: ShieldAlert },
  { to: "/oportunidades-mejora", label: "Oportunidades de Mejora", icon: Lightbulb },
  { to: "/reportes", label: "Reportes", icon: FileBarChart2 },
  { to: "/configuracion", label: "Configuración", icon: Settings, admin: true },
];

export function AppLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [overdue, setOverdue] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("actions")
      .select("id", { count: "exact", head: true })
      .neq("status", "cerrada")
      .lt("due_date", today)
      .then(({ count }) => setOverdue(count ?? 0));
  }, [pathname]);

  const initials = (user?.email ?? "U")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-10 rounded-lg bg-sidebar-primary grid place-items-center">
            <ShieldCheck className="size-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="font-bold leading-tight">SGC</p>
            <p className="text-[11px] opacity-70">ISO 9001:2015</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav
            .filter((n) => !n.admin || role === "administrador")
            .map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
        </nav>
        <div className="p-4 text-xs opacity-60 border-t border-sidebar-border">
          v1.0 · Lovable Cloud
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="font-semibold text-lg">SGC — Acciones y Mejoras</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Sistema de Gestión de Calidad ISO 9001:2015
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/acciones-correctivas">
                <Bell className="size-5" />
                {overdue > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-destructive text-destructive-foreground">
                    {overdue}
                  </Badge>
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="size-9 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{user?.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">{role}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}