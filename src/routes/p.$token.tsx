import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, FileText } from "lucide-react";
import { formatBRL, formatNumeroProposta, formatDate, statusClass, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/p/$token")({ component: PropostaPublica });

function PropostaPublica() {
  const { token } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState<null | "aceitar" | "recusar">(null);
  const [nome, setNome] = useState("");
  const [motivo, setMotivo] = useState("");

  const carregar = async () => {
    const { data: r, error } = await supabase.rpc("get_proposta_publica", { _token: token });
    if (error) toast.error(error.message);
    setData(r);
    setLoading(false);
  };
  useEffect(() => { carregar(); }, [token]);

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando...</div>;
  if (!data) return <div className="grid min-h-screen place-items-center"><div className="text-center"><FileText className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-3">Proposta não encontrada.</p></div></div>;

  const { proposta: p, cliente, empresa, itens } = data;
  const cor = empresa?.cor_marca || "#0F4C75";
  const finalizado = ["aceita", "recusada", "expirada"].includes(p.status);

  const aceitar = async () => {
    if (!nome) return;
    const { error } = await supabase.rpc("aceitar_proposta", { _token: token, _nome: nome });
    if (error) toast.error(error.message); else { toast.success("Proposta aceita!"); setAcao(null); carregar(); }
  };
  const recusar = async () => {
    const { error } = await supabase.rpc("recusar_proposta", { _token: token, _motivo: motivo });
    if (error) toast.error(error.message); else { toast.success("Resposta registrada"); setAcao(null); carregar(); }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: cor }}>
            <div className="flex items-center gap-3">
              {empresa?.logo_url && <img src={empresa.logo_url} alt="logo" className="h-12 object-contain" />}
              <div>
                <div className="font-bold" style={{ color: cor }}>{empresa?.nome_empresa}</div>
                <div className="text-xs text-muted-foreground">{empresa?.email_contato} · {empresa?.telefone}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Proposta</div>
              <div className="font-mono text-xl font-bold">#{formatNumeroProposta(p.numero)}</div>
              <span className={statusClass[p.status]}>{statusLabel[p.status]}</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase text-muted-foreground">Para</div>
            <div className="font-semibold">{cliente?.nome_empresa}</div>
            {cliente?.nome_responsavel && <div className="text-sm text-muted-foreground">{cliente.nome_responsavel}</div>}
          </div>

          <h1 className="mt-6 text-2xl font-bold" style={{ color: cor }}>{p.titulo}</h1>
          <div className="mt-2 text-xs text-muted-foreground">Emitida em {formatDate(p.data_emissao)} · Validade {p.validade_dias} dias</div>

          <table className="mt-6 w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-2 py-2">Item</th><th className="px-2 py-2 text-right">Qtd</th><th className="px-2 py-2 text-right">Valor</th></tr></thead>
            <tbody className="divide-y divide-border">
              {itens.map((i: any) => (<tr key={i.id}><td className="px-2 py-2"><div className="font-medium">{i.nome}</div><div className="text-xs text-muted-foreground">{i.descricao}</div></td><td className="px-2 py-2 text-right font-mono">{i.quantidade}</td><td className="px-2 py-2 text-right font-mono">{formatBRL(i.valor_total_item)}</td></tr>))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-end gap-4 border-t-2 pt-3" style={{ borderColor: cor }}>
            <span className="font-semibold">Total</span>
            <span className="font-mono text-2xl font-bold" style={{ color: cor }}>{formatBRL(p.valor_total)}</span>
          </div>

          {[
            { t: "Prazo de execução", v: p.prazo_execucao },
            { t: "Condições de pagamento", v: p.condicoes_pagamento },
            { t: "LGPD", v: p.clausula_lgpd },
            { t: "Garantia", v: p.clausula_garantia },
            { t: "Suporte", v: p.clausula_suporte },
          ].filter(s => s.v).map((s) => (
            <div key={s.t} className="mt-4"><div className="text-xs font-semibold uppercase text-muted-foreground">{s.t}</div><p className="text-sm whitespace-pre-line">{s.v}</p></div>
          ))}

          {!finalizado ? (
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <button onClick={() => setAcao("aceitar")} className="rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Aceitar proposta</button>
              <button onClick={() => setAcao("recusar")} className="rounded-md border border-border py-3 text-sm font-medium hover:bg-muted">Recusar com observação</button>
            </div>
          ) : (
            <div className="mt-8 rounded-lg bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-2 font-semibold">Proposta {statusLabel[p.status].toLowerCase()}</p>
              {p.aceita_nome && <p className="text-sm text-muted-foreground">por {p.aceita_nome}</p>}
            </div>
          )}
        </div>
      </div>

      {acao === "aceitar" && (
        <Modal title="Aceitar proposta" onClose={() => setAcao(null)} onConfirm={aceitar} confirmLabel="Confirmar aceite">
          <input autoFocus placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm" />
        </Modal>
      )}
      {acao === "recusar" && (
        <Modal title="Recusar proposta" onClose={() => setAcao(null)} onConfirm={recusar} confirmLabel="Enviar recusa">
          <textarea autoFocus rows={3} placeholder="Motivo da recusa" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm" />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose, onConfirm, confirmLabel }: any) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
        <h3 className="mb-3 font-semibold">{title}</h3>
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancelar</button>
          <button onClick={onConfirm} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
