import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, FileText, Users, Settings, User, Plus, Shield, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({ component: AuthLayout });

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/propostas", label: "Propostas", icon: FileText },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/configuracoes/empresa", label: "Configurações", icon: Settings },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function AuthLayout() {
  const { loading, session, profile, hasEmpresa, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate({ to: "/login" }); return; }
    if (hasEmpresa === false && location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [loading, session, hasEmpresa, location.pathname, navigate]);

  if (loading || !session) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando...</div>;
  }

  const isAdminArea = location.pathname.startsWith("/admin");
  const isOnboarding = location.pathname === "/onboarding";

  if (isOnboarding) {
    return <div className="min-h-screen bg-background"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">P</div>
          <span className="font-semibold">PropostaPro</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((it) => (
            <Link key={it.to} to={it.to} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <>
              <div className="mt-6 px-3 text-xs font-semibold uppercase text-muted-foreground">Administração</div>
              <Link to="/admin" className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <Shield className="h-4 w-4" /> Painel admin
              </Link>
              <Link to="/admin/usuarios" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <ChevronRight className="h-3 w-3" /> Usuários
              </Link>
              <Link to="/admin/catalogo" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <ChevronRight className="h-3 w-3" /> Catálogo
              </Link>
              <Link to="/admin/clausulas" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <ChevronRight className="h-3 w-3" /> Cláusulas
              </Link>
              <Link to="/admin/metricas" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <ChevronRight className="h-3 w-3" /> Métricas
              </Link>
            </>
          )}
        </nav>
        <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-error hover:bg-red-50">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      {/* Top header */}
      <div className="md:pl-64">
        <header className={"sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border px-4 md:px-6 " + (isAdminArea ? "bg-accent/15" : "bg-surface")}>
          <div className="md:hidden flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">P</div>
            <span className="text-sm font-semibold">PropostaPro</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {profile?.role === "admin" && (
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Admin</span>
            )}
            <span className="text-sm text-muted-foreground">{profile?.nome || profile?.email}</span>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-surface md:hidden">
        <Link to="/dashboard" className="flex flex-col items-center py-2 text-xs [&.active]:text-primary" activeProps={{ className: "active" }}>
          <LayoutDashboard className="h-5 w-5" /> Início
        </Link>
        <Link to="/propostas" className="flex flex-col items-center py-2 text-xs [&.active]:text-primary" activeProps={{ className: "active" }}>
          <FileText className="h-5 w-5" /> Propostas
        </Link>
        <Link to="/propostas/nova" className="flex flex-col items-center py-2 text-xs text-primary">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></div>
        </Link>
        <Link to="/clientes" className="flex flex-col items-center py-2 text-xs [&.active]:text-primary" activeProps={{ className: "active" }}>
          <Users className="h-5 w-5" /> Clientes
        </Link>
        <Link to="/perfil" className="flex flex-col items-center py-2 text-xs [&.active]:text-primary" activeProps={{ className: "active" }}>
          <User className="h-5 w-5" /> Perfil
        </Link>
      </nav>
    </div>
  );
}

// helper exported to validate admin in child routes
export function useRequireAdmin() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      toast.error("Você não tem permissão para acessar esta área");
      navigate({ to: "/dashboard" });
    }
  }, [loading, profile, navigate]);
  return profile?.role === "admin";
}
