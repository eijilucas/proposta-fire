import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const empty = { nome_empresa: "", nome_responsavel: "", cnpj: "", email: "", telefone: "", endereco: "", cidade: "", tipo_negocio: "outro", qtd_computadores: 0, observacoes: "" };

export const Route = createFileRoute("/_authenticated/clientes/novo")({ component: () => <ClienteForm /> });

export function ClienteForm({ id }: { id?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) supabase.from("clientes").select("*").eq("id", id).maybeSingle().then(({ data }) => data && setForm(data));
  }, [id]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const payload = { ...form, user_id: user.id };
    const { error, data } = id
      ? await supabase.from("clientes").update(payload).eq("id", id).select().single()
      : await supabase.from("clientes").insert(payload).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo");
    navigate({ to: "/clientes/$id", params: { id: data.id } });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{id ? "Editar" : "Novo"} cliente</h1>
      <form onSubmit={salvar} className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <F label="Nome da empresa *"><input required value={form.nome_empresa} onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })} className="i" /></F>
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Responsável"><input value={form.nome_responsavel || ""} onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })} className="i" /></F>
          <F label="CNPJ"><input value={form.cnpj || ""} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="i font-mono" /></F>
          <F label="Email"><input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="i" /></F>
          <F label="Telefone"><input value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="i" /></F>
        </div>
        <F label="Endereço"><input value={form.endereco || ""} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="i" /></F>
        <div className="grid gap-4 md:grid-cols-3">
          <F label="Cidade"><input value={form.cidade || ""} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="i" /></F>
          <F label="Tipo de negócio">
            <select value={form.tipo_negocio || "outro"} onChange={(e) => setForm({ ...form, tipo_negocio: e.target.value })} className="i">
              <option value="escritorio_contabil">Escritório contábil</option>
              <option value="clinica_medica">Clínica médica</option>
              <option value="comercio_local">Comércio local</option>
              <option value="industria_pequena">Indústria pequena</option>
              <option value="escritorio_advocacia">Escritório advocacia</option>
              <option value="outro">Outro</option>
            </select>
          </F>
          <F label="Qtd computadores"><input type="number" value={form.qtd_computadores || 0} onChange={(e) => setForm({ ...form, qtd_computadores: Number(e.target.value) })} className="i font-mono" /></F>
        </div>
        <F label="Observações"><textarea rows={3} value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className="i" /></F>
        <button disabled={loading} className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60">Salvar</button>
      </form>
      <style>{`.i{width:100%;border:1px solid var(--input);background:var(--surface);padding:0.5rem 0.75rem;border-radius:0.375rem;font-size:0.875rem;outline:none}.i:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}
