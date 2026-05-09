import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/propostas/$id/editar")({ component: EditarProposta });

function EditarProposta() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("propostas").select("*").eq("id", id).maybeSingle().then(({ data }) => { setP(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!p) return <div className="p-8 text-center">Proposta não encontrada.</div>;
  if (p.status !== "rascunho") return <div className="p-8 text-center">Apenas rascunhos podem ser editados.</div>;

  const salvar = async () => {
    const { error } = await supabase.from("propostas").update({
      titulo: p.titulo, prazo_execucao: p.prazo_execucao, validade_dias: p.validade_dias,
      condicoes_pagamento: p.condicoes_pagamento, clausula_lgpd: p.clausula_lgpd,
      clausula_garantia: p.clausula_garantia, clausula_suporte: p.clausula_suporte, observacoes: p.observacoes,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo");
    navigate({ to: "/propostas/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Editar proposta</h1>
      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <Input label="Título" value={p.titulo} onChange={(v) => setP({ ...p, titulo: v })} />
        <Input label="Prazo de execução" value={p.prazo_execucao || ""} onChange={(v) => setP({ ...p, prazo_execucao: v })} />
        <Input label="Validade (dias)" type="number" value={p.validade_dias} onChange={(v) => setP({ ...p, validade_dias: Number(v) })} />
        <Area label="Condições de pagamento" value={p.condicoes_pagamento || ""} onChange={(v) => setP({ ...p, condicoes_pagamento: v })} />
        <Area label="Cláusula LGPD" value={p.clausula_lgpd || ""} onChange={(v) => setP({ ...p, clausula_lgpd: v })} />
        <Area label="Cláusula garantia" value={p.clausula_garantia || ""} onChange={(v) => setP({ ...p, clausula_garantia: v })} />
        <Area label="Cláusula suporte" value={p.clausula_suporte || ""} onChange={(v) => setP({ ...p, clausula_suporte: v })} />
        <Area label="Observações" value={p.observacoes || ""} onChange={(v) => setP({ ...p, observacoes: v })} />
        <button onClick={salvar} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Salvar alterações</button>
      </div>
    </div>
  );
}
function Input({ label, value, onChange, type = "text" }: any) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm" /></div>;
}
function Area({ label, value, onChange }: any) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm" /></div>;
}
