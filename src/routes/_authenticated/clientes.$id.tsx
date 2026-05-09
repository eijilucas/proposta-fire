import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus } from "lucide-react";
import { formatBRL, formatNumeroProposta, statusClass, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clientes/$id")({ component: DetalheCliente });

function DetalheCliente() {
  const { id } = Route.useParams();
  const [c, setC] = useState<any>(null);
  const [props, setProps] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("clientes").select("*").eq("id", id).maybeSingle().then(({ data }) => setC(data));
    supabase.from("propostas").select("id,numero,titulo,status,valor_total").eq("cliente_id", id).order("created_at", { ascending: false }).then(({ data }) => setProps(data ?? []));
  }, [id]);

  if (!c) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{c.nome_empresa}</h1>
        <div className="flex gap-2">
          <Link to="/clientes/$id/editar" params={{ id }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><Pencil className="h-4 w-4" /> Editar</Link>
          <Link to="/propostas/nova" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Nova proposta</Link>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div><span className="text-muted-foreground">Responsável:</span> {c.nome_responsavel || "-"}</div>
          <div><span className="text-muted-foreground">CNPJ:</span> <span className="font-mono">{c.cnpj || "-"}</span></div>
          <div><span className="text-muted-foreground">Email:</span> {c.email || "-"}</div>
          <div><span className="text-muted-foreground">Telefone:</span> {c.telefone || "-"}</div>
          <div><span className="text-muted-foreground">Cidade:</span> {c.cidade || "-"}</div>
          <div><span className="text-muted-foreground">Computadores:</span> {c.qtd_computadores ?? "-"}</div>
        </div>
        {c.observacoes && <p className="mt-3 text-muted-foreground">{c.observacoes}</p>}
      </div>
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3 font-semibold">Propostas vinculadas</div>
        {props.length === 0 ? <div className="p-6 text-center text-sm text-muted-foreground">Nenhuma proposta.</div> :
          <ul className="divide-y divide-border">
            {props.map((p) => (
              <li key={p.id}><Link to="/propostas/$id" params={{ id: p.id }} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30">
                <div className="flex items-center gap-3"><span className="font-mono text-sm text-muted-foreground">#{formatNumeroProposta(p.numero)}</span><span className="text-sm font-medium">{p.titulo}</span></div>
                <div className="flex items-center gap-3"><span className={statusClass[p.status]}>{statusLabel[p.status]}</span><span className="font-mono text-sm">{formatBRL(p.valor_total)}</span></div>
              </Link></li>
            ))}
          </ul>}
      </div>
    </div>
  );
}
