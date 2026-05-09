import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/propostas/nova")({ component: NovaProposta });

type Item = { id: string; nome: string; descricao: string; unidade: string; quantidade: number; valor_unitario: number; servico_catalogo_id?: string };

function NovaProposta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [novoCliente, setNovoCliente] = useState<any | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [cond, setCond] = useState({
    titulo: "", prazo_execucao: "", validade_dias: 7,
    condicoes_pagamento: "", clausula_lgpd: "", clausula_garantia: "", clausula_suporte: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("clientes").select("id,nome_empresa").eq("user_id", user.id).order("nome_empresa").then(({ data }) => setClientes(data ?? []));
    supabase.from("servicos_catalogo").select("*").eq("ativo", true).order("nome").then(({ data }) => setCatalogo(data ?? []));
    supabase.from("configuracoes_admin").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setCond((c) => ({ ...c, condicoes_pagamento: data.condicoes_pagamento ?? "", clausula_lgpd: data.clausula_lgpd ?? "", clausula_garantia: data.clausula_garantia ?? "", clausula_suporte: data.clausula_suporte ?? "" }));
    });
  }, [user]);

  const total = itens.reduce((s, i) => s + Number(i.quantidade || 0) * Number(i.valor_unitario || 0), 0);

  const addServico = (s: any) => {
    setItens((prev) => [...prev, { id: crypto.randomUUID(), nome: s.nome, descricao: s.descricao_padrao || "", unidade: s.unidade || "por_servico", quantidade: 1, valor_unitario: Number(s.valor_sugerido || 0), servico_catalogo_id: s.id }]);
  };
  const addLivre = () => setItens((p) => [...p, { id: crypto.randomUUID(), nome: "Item personalizado", descricao: "", unidade: "por_servico", quantidade: 1, valor_unitario: 0 }]);
  const updateItem = (id: string, patch: Partial<Item>) => setItens((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItens((p) => p.filter((i) => i.id !== id));

  const salvarNovoCliente = async () => {
    if (!user || !novoCliente?.nome_empresa) return;
    const { data, error } = await supabase.from("clientes").insert({ ...novoCliente, user_id: user.id }).select().single();
    if (error) { toast.error(error.message); return; }
    setClientes((p) => [...p, data]);
    setClienteId(data.id);
    setNovoCliente(null);
    toast.success("Cliente cadastrado");
  };

  const salvar = async (statusFinal: "rascunho" | "enviada") => {
    if (!user) return;
    if (!clienteId) { toast.error("Selecione um cliente"); setStep(1); return; }
    if (itens.length === 0) { toast.error("Adicione pelo menos um item"); setStep(2); return; }
    if (!cond.titulo) { toast.error("Informe o título"); setStep(3); return; }
    setSaving(true);
    const { data: numData } = await supabase.rpc("proximo_numero_proposta");
    const numero = (numData as number | null) ?? 1;
    const { data: prop, error } = await supabase.from("propostas").insert({
      user_id: user.id, cliente_id: clienteId, numero,
      titulo: cond.titulo, prazo_execucao: cond.prazo_execucao, validade_dias: cond.validade_dias,
      condicoes_pagamento: cond.condicoes_pagamento, clausula_lgpd: cond.clausula_lgpd,
      clausula_garantia: cond.clausula_garantia, clausula_suporte: cond.clausula_suporte,
      status: statusFinal,
    }).select().single();
    if (error || !prop) { setSaving(false); toast.error(error?.message || "Erro"); return; }
    const itensInsert = itens.map((i, idx) => ({ proposta_id: prop.id, servico_catalogo_id: i.servico_catalogo_id, nome: i.nome, descricao: i.descricao, unidade: i.unidade, quantidade: i.quantidade, valor_unitario: i.valor_unitario, ordem: idx }));
    const { error: e2 } = await supabase.from("proposta_itens").insert(itensInsert);
    setSaving(false);
    if (e2) { toast.error(e2.message); return; }
    toast.success("Proposta criada!");
    navigate({ to: "/propostas/$id", params: { id: prop.id } });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Nova proposta</h1>
      <div className="flex items-center gap-2 text-sm">
        {["Cliente", "Serviços", "Condições", "Revisão"].map((label, i) => (
          <div key={label} className={"flex items-center gap-2 " + (step === i + 1 ? "text-primary font-semibold" : step > i + 1 ? "text-accent" : "text-muted-foreground")}>
            <span className={"grid h-6 w-6 place-items-center rounded-full border " + (step >= i + 1 ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{i + 1}</span>
            <span>{label}</span>
            {i < 3 && <span className="mx-2 text-muted-foreground">→</span>}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Cliente</h2>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm">
              <option value="">Selecione um cliente cadastrado</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome_empresa}</option>)}
            </select>
            {!novoCliente ? (
              <button onClick={() => setNovoCliente({ nome_empresa: "", nome_responsavel: "", cnpj: "", email: "", telefone: "" })} className="text-sm font-medium text-primary hover:underline">+ Cadastrar novo cliente</button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <input placeholder="Nome da empresa *" value={novoCliente.nome_empresa} onChange={(e) => setNovoCliente({ ...novoCliente, nome_empresa: e.target.value })} className="w-full rounded border border-input px-3 py-2 text-sm" />
                <input placeholder="Responsável" value={novoCliente.nome_responsavel} onChange={(e) => setNovoCliente({ ...novoCliente, nome_responsavel: e.target.value })} className="w-full rounded border border-input px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="CNPJ" value={novoCliente.cnpj} onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: e.target.value })} className="rounded border border-input px-3 py-2 text-sm font-mono" />
                  <input placeholder="Telefone" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} className="rounded border border-input px-3 py-2 text-sm" />
                </div>
                <input placeholder="Email" value={novoCliente.email} onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })} className="w-full rounded border border-input px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={salvarNovoCliente} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Salvar cliente</button>
                  <button onClick={() => setNovoCliente(null)} className="rounded-md border border-border px-4 py-2 text-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 font-semibold">Catálogo</h2>
              <div className="space-y-2">
                {catalogo.map((s) => (
                  <div key={s.id} className="flex items-start justify-between rounded-md border border-border p-3">
                    <div className="pr-2">
                      <div className="text-sm font-medium">{s.nome}</div>
                      <div className="text-xs text-muted-foreground">{formatBRL(s.valor_sugerido)} · {s.unidade}</div>
                    </div>
                    <button onClick={() => addServico(s)} className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover">Adicionar</button>
                  </div>
                ))}
                <button onClick={addLivre} className="w-full rounded-md border border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted">+ Item livre</button>
              </div>
            </div>
            <div>
              <h2 className="mb-3 font-semibold">Itens da proposta</h2>
              {itens.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum item ainda.</p> : (
                <div className="space-y-3">
                  {itens.map((i) => (
                    <div key={i.id} className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <input value={i.nome} onChange={(e) => updateItem(i.id, { nome: e.target.value })} className="flex-1 rounded border border-input px-2 py-1 text-sm font-medium" />
                        <button onClick={() => removeItem(i.id)} className="text-error hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <textarea value={i.descricao} onChange={(e) => updateItem(i.id, { descricao: e.target.value })} placeholder="Descrição" className="mt-2 w-full rounded border border-input px-2 py-1 text-xs" rows={2} />
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <input type="number" min="0" step="0.01" value={i.quantidade} onChange={(e) => updateItem(i.id, { quantidade: Number(e.target.value) })} className="rounded border border-input px-2 py-1 font-mono" />
                        <input type="number" min="0" step="0.01" value={i.valor_unitario} onChange={(e) => updateItem(i.id, { valor_unitario: Number(e.target.value) })} className="rounded border border-input px-2 py-1 font-mono" />
                        <div className="grid place-items-center font-mono text-sm">{formatBRL(i.quantidade * i.valor_unitario)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-3 font-semibold">
                    <span>Total</span><span className="font-mono text-primary">{formatBRL(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Condições</h2>
            <Field label="Título da proposta *"><input value={cond.titulo} onChange={(e) => setCond({ ...cond, titulo: e.target.value })} className="input" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prazo de execução"><input value={cond.prazo_execucao} onChange={(e) => setCond({ ...cond, prazo_execucao: e.target.value })} placeholder="Ex: 5 dias úteis" className="input" /></Field>
              <Field label="Validade (dias)"><input type="number" value={cond.validade_dias} onChange={(e) => setCond({ ...cond, validade_dias: Number(e.target.value) })} className="input font-mono" /></Field>
            </div>
            <Field label="Condições de pagamento"><textarea rows={2} value={cond.condicoes_pagamento} onChange={(e) => setCond({ ...cond, condicoes_pagamento: e.target.value })} className="input" /></Field>
            <Field label="Cláusula LGPD"><textarea rows={3} value={cond.clausula_lgpd} onChange={(e) => setCond({ ...cond, clausula_lgpd: e.target.value })} className="input" /></Field>
            <Field label="Cláusula garantia"><textarea rows={3} value={cond.clausula_garantia} onChange={(e) => setCond({ ...cond, clausula_garantia: e.target.value })} className="input" /></Field>
            <Field label="Cláusula suporte"><textarea rows={3} value={cond.clausula_suporte} onChange={(e) => setCond({ ...cond, clausula_suporte: e.target.value })} className="input" /></Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Revisão</h2>
            <div className="rounded-lg border border-border p-4 text-sm">
              <div><strong>Cliente:</strong> {clientes.find((c) => c.id === clienteId)?.nome_empresa}</div>
              <div><strong>Título:</strong> {cond.titulo}</div>
              <div><strong>Itens:</strong> {itens.length}</div>
              <div><strong>Valor total:</strong> <span className="font-mono">{formatBRL(total)}</span></div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button disabled={step === 1} onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Avançar <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <div className="flex gap-2">
              <button disabled={saving} onClick={() => salvar("rascunho")} className="rounded-md border border-border px-4 py-2 text-sm">Salvar como rascunho</button>
              <button disabled={saving} onClick={() => salvar("enviada")} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Salvar e gerar link</button>
            </div>
          )}
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--input);background:var(--surface);padding:0.5rem 0.75rem;border-radius:0.375rem;font-size:0.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}
