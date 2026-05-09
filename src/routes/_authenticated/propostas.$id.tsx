import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Copy, Download, MessageCircle, Pencil, Trash2, Send, CheckCheck } from "lucide-react";
import { formatBRL, formatNumeroProposta, formatDate, statusClass, statusLabel } from "@/lib/format";
import { downloadPropostaPDF } from "@/lib/proposta-pdf";

export const Route = createFileRoute("/_authenticated/propostas/$id")({ component: DetalheProposta });

function DetalheProposta() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const { data: prop } = await supabase.from("propostas").select("*, clientes(*)").eq("id", id).maybeSingle();
    const { data: itens } = await supabase.from("proposta_itens").select("*").eq("proposta_id", id).order("ordem");
    const { data: empresa } = await supabase.from("dados_empresa").select("*").eq("user_id", user!.id).maybeSingle();
    setData({ proposta: prop, cliente: prop?.clientes, itens: itens ?? [], empresa });
    setLoading(false);
  };

  useEffect(() => { if (user) reload(); }, [id, user]);

  if (loading || !data?.proposta) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const p = data.proposta;
  const linkPublico = `${window.location.origin}/p/${p.link_publico_token}`;

  const copyLink = () => { navigator.clipboard.writeText(linkPublico); toast.success("Link copiado"); };
  const whatsapp = () => {
    const txt = encodeURIComponent(`Olá! Segue minha proposta comercial #${formatNumeroProposta(p.numero)}: ${linkPublico}`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  };
  const baixarPDF = () => downloadPropostaPDF(data);
  const marcarEnviada = async () => {
    await supabase.from("propostas").update({ status: "enviada" }).eq("id", id);
    toast.success("Marcada como enviada"); reload();
  };
  const marcarAceita = async () => {
    const nome = prompt("Nome de quem aceitou:") || "Manual";
    await supabase.from("propostas").update({ status: "aceita", aceita_em: new Date().toISOString(), aceita_nome: nome }).eq("id", id);
    toast.success("Aceite registrado"); reload();
  };
  const excluir = async () => {
    if (!confirm("Excluir esta proposta?")) return;
    await supabase.from("propostas").delete().eq("id", id);
    toast.success("Excluída"); navigate({ to: "/propostas" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-mono text-sm text-muted-foreground">#{formatNumeroProposta(p.numero)}</div>
              <h1 className="mt-1 text-2xl font-bold">{p.titulo}</h1>
              <div className="mt-1 text-sm text-muted-foreground">Cliente: {data.cliente?.nome_empresa}</div>
            </div>
            <div className="text-right">
              <span className={statusClass[p.status] + " text-sm"}>{statusLabel[p.status]}</span>
              <div className="mt-2 font-mono text-2xl font-bold text-primary">{formatBRL(p.valor_total)}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={copyLink} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><Copy className="h-4 w-4" /> Copiar link</button>
            <button onClick={baixarPDF} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><Download className="h-4 w-4" /> Baixar PDF</button>
            <button onClick={whatsapp} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
            {p.status === "rascunho" && <button onClick={marcarEnviada} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Send className="h-4 w-4" /> Marcar enviada</button>}
            {p.status !== "aceita" && p.status !== "rascunho" && <button onClick={marcarAceita} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><CheckCheck className="h-4 w-4" /> Marcar aceita</button>}
            {p.status === "rascunho" && <Link to="/propostas/$id/editar" params={{ id }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><Pencil className="h-4 w-4" /> Editar</Link>}
            <button onClick={excluir} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-error hover:bg-red-50"><Trash2 className="h-4 w-4" /> Excluir</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-3 font-semibold">Itens</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
              <tr><th className="py-2">Item</th><th className="py-2 text-right">Qtd</th><th className="py-2 text-right">Valor unit.</th><th className="py-2 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.itens.map((i: any) => (
                <tr key={i.id}><td className="py-2"><div className="font-medium">{i.nome}</div><div className="text-xs text-muted-foreground">{i.descricao}</div></td><td className="py-2 text-right font-mono">{i.quantidade}</td><td className="py-2 text-right font-mono">{formatBRL(i.valor_unitario)}</td><td className="py-2 text-right font-mono font-semibold">{formatBRL(i.valor_total_item)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {[
          { t: "Prazo de execução", v: p.prazo_execucao },
          { t: "Condições de pagamento", v: p.condicoes_pagamento },
          { t: "LGPD", v: p.clausula_lgpd },
          { t: "Garantia", v: p.clausula_garantia },
          { t: "Suporte", v: p.clausula_suporte },
        ].filter(s => s.v).map((s) => (
          <div key={s.t} className="rounded-xl border border-border bg-surface p-6"><h4 className="mb-1 font-semibold">{s.t}</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{s.v}</p></div>
        ))}
      </div>

      <aside className="rounded-xl border border-border bg-surface p-6 h-fit">
        <h3 className="mb-3 font-semibold">Linha do tempo</h3>
        <ul className="space-y-3 text-sm">
          <li><span className="text-muted-foreground">Criada:</span> {formatDate(p.created_at)}</li>
          {p.visualizada_em && <li><span className="text-muted-foreground">Visualizada:</span> {formatDate(p.visualizada_em)}</li>}
          {p.aceita_em && <li><span className="text-muted-foreground">Aceita por {p.aceita_nome}:</span> {formatDate(p.aceita_em)}</li>}
          {p.recusada_em && <li><span className="text-muted-foreground">Recusada:</span> {formatDate(p.recusada_em)} <p className="text-xs">{p.motivo_recusa}</p></li>}
        </ul>
        <div className="mt-4 rounded-md bg-muted p-3 text-xs">
          <div className="text-muted-foreground">Link público</div>
          <div className="mt-1 break-all font-mono">{linkPublico}</div>
        </div>
      </aside>
    </div>
  );
}
