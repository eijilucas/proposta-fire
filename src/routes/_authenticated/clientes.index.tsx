import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Plus, Users, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clientes/")({ component: ListaClientes });

function ListaClientes() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("clientes").select("*, propostas(count)").eq("user_id", user.id).order("nome_empresa").then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [user]);

  const filtered = items.filter((c) => !q || c.nome_empresa?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link to="/clientes/novo" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Novo cliente</Link>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar cliente" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-md border border-input bg-surface py-2 pl-9 pr-3 text-sm" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface">
        {loading ? <div className="p-8 text-center text-muted-foreground">Carregando...</div> :
          filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 font-semibold">Nenhum cliente cadastrado</h3>
              <Link to="/clientes/novo" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Cadastrar primeiro cliente</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Cidade</th><th className="px-4 py-3">Computadores</th></tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3"><Link to="/clientes/$id" params={{ id: c.id }} className="font-medium text-primary hover:underline">{c.nome_empresa}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.tipo_negocio || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.cidade || "-"}</td>
                    <td className="px-4 py-3 font-mono">{c.qtd_computadores ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
