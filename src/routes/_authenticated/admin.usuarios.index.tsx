import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/usuarios/")({ component: ListaUsuarios });

function ListaUsuarios() {
  const isAdmin = useRequireAdmin();
  const [items, setItems] = useState<any[]>([]);
  const reload = () => supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  const setRole = async (id: string, role: string) => { await supabase.from("profiles").update({ role }).eq("id", id); toast.success("Role atualizada"); reload(); };
  const setAtivo = async (id: string, ativo: boolean) => { await supabase.from("profiles").update({ ativo }).eq("id", id); reload(); };

  if (!isAdmin) return null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usuários</h1>
      <div className="rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead>
          <tbody className="divide-y divide-border">
            {items.map(u => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><Link to="/admin/usuarios/$id" params={{ id: u.id }} className="font-medium text-primary hover:underline">{u.nome || "-"}</Link></td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.ativo ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3 space-x-2">
                  {u.role === "user" ? <button onClick={() => setRole(u.id, "admin")} className="text-xs text-primary hover:underline">Promover</button> : <button onClick={() => setRole(u.id, "user")} className="text-xs text-primary hover:underline">Rebaixar</button>}
                  <button onClick={() => setAtivo(u.id, !u.ativo)} className="text-xs text-muted-foreground hover:underline">{u.ativo ? "Desativar" : "Ativar"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
