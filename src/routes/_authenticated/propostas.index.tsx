import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Plus, FileText, Search } from "lucide-react";
import { formatBRL, formatNumeroProposta, formatDate, statusClass, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/propostas/")({ component: ListaPropostas });

function ListaPropostas() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      let query = supabase.from("propostas").select("id,numero,titulo,status,valor_total,data_emissao,clientes(nome_empresa)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (status) query = query.eq("status", status);
      const { data } = await query;
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [user, status]);

  const filtered = items.filter((p) =>
    !q || p.titulo?.toLowerCase().includes(q.toLowerCase()) ||
    p.clientes?.nome_empresa?.toLowerCase().includes(q.toLowerCase()) ||
    String(p.numero).includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Propostas</h1>
        <Link to="/propostas/nova" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Nova proposta</Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar por número, título ou cliente" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-md border border-input bg-surface py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-input bg-surface px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        {loading ? <div className="p-8 text-center text-muted-foreground">Carregando...</div> :
         filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Nenhuma proposta encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta agora.</p>
            <Link to="/propostas/nova" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Nova proposta</Link>
          </div>
         ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Número</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Título</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">#{formatNumeroProposta(p.numero)}</td>
                  <td className="px-4 py-3">{p.clientes?.nome_empresa}</td>
                  <td className="px-4 py-3"><Link to="/propostas/$id" params={{ id: p.id }} className="font-medium text-primary hover:underline">{p.titulo}</Link></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.data_emissao)}</td>
                  <td className="px-4 py-3 font-mono">{formatBRL(p.valor_total)}</td>
                  <td className="px-4 py-3"><span className={statusClass[p.status]}>{statusLabel[p.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
         )}
      </div>
    </div>
  );
}
