import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/catalogo")({ component: Catalogo });

function Catalogo() {
  const isAdmin = useRequireAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const reload = () => supabase.from("servicos_catalogo").select("*").order("nome").then(({ data }) => setItems(data ?? []));
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  const salvar = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    const { error } = id
      ? await supabase.from("servicos_catalogo").update(rest).eq("id", id)
      : await supabase.from("servicos_catalogo").insert(rest);
    if (error) toast.error(error.message); else { toast.success("Salvo"); setEditing(null); reload(); }
  };

  if (!isAdmin) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo de serviços</h1>
        <button onClick={() => setEditing({ nome: "", descricao_padrao: "", unidade: "por_servico", valor_sugerido: 0, ativo: true })} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Novo serviço</button>
      </div>
      <div className="rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-border">{items.map(s => (
            <tr key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setEditing(s)}>
              <td className="px-4 py-3 font-medium">{s.nome}</td><td className="px-4 py-3">{s.unidade}</td><td className="px-4 py-3 font-mono">{formatBRL(s.valor_sugerido)}</td><td className="px-4 py-3">{s.ativo ? "Ativo" : "Inativo"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg space-y-3 rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="font-semibold">{editing.id ? "Editar" : "Novo"} serviço</h3>
            <input placeholder="Nome" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className="w-full rounded border border-input px-3 py-2 text-sm" />
            <textarea placeholder="Descrição padrão" rows={3} value={editing.descricao_padrao || ""} onChange={(e) => setEditing({ ...editing, descricao_padrao: e.target.value })} className="w-full rounded border border-input px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={editing.unidade} onChange={(e) => setEditing({ ...editing, unidade: e.target.value })} className="rounded border border-input px-3 py-2 text-sm"><option value="por_servico">Por serviço</option><option value="por_hora">Por hora</option><option value="por_mes">Por mês</option></select>
              <input type="number" value={editing.valor_sugerido || 0} onChange={(e) => setEditing({ ...editing, valor_sugerido: Number(e.target.value) })} className="rounded border border-input px-3 py-2 text-sm font-mono" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.ativo} onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })} /> Ativo</label>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="rounded border border-border px-4 py-2 text-sm">Cancelar</button>
              <button onClick={salvar} className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
