import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes/empresa")({ component: ConfigEmpresa });

function ConfigEmpresa() {
  const { user } = useAuth();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("dados_empresa").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { setForm(data); setLoading(false); });
  }, [user]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form) return;
    const { error } = await supabase.from("dados_empresa").update({ ...form, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Salvo");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!form) return <div className="p-8 text-center">Nenhum dado de empresa.</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Dados da empresa</h1>
      <form onSubmit={salvar} className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <F label="Nome da empresa"><input required value={form.nome_empresa} onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })} className="i" /></F>
        <div className="grid gap-4 md:grid-cols-2">
          <F label="CNPJ ou MEI"><input value={form.cnpj_ou_mei || ""} onChange={(e) => setForm({ ...form, cnpj_ou_mei: e.target.value })} className="i font-mono" /></F>
          <F label="Telefone"><input value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="i" /></F>
        </div>
        <F label="Responsável"><input value={form.nome_responsavel || ""} onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })} className="i" /></F>
        <F label="Email"><input value={form.email_contato || ""} onChange={(e) => setForm({ ...form, email_contato: e.target.value })} className="i" /></F>
        <F label="Endereço"><input value={form.endereco || ""} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="i" /></F>
        <div className="grid gap-4 md:grid-cols-2">
          <F label="Cidade"><input value={form.cidade || ""} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="i" /></F>
          <F label="Estado"><input maxLength={2} value={form.estado || ""} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} className="i" /></F>
        </div>
        <F label="Cor da marca">
          <div className="flex items-center gap-3">
            <input type="color" value={form.cor_marca || "#0F4C75"} onChange={(e) => setForm({ ...form, cor_marca: e.target.value })} className="h-10 w-16 rounded border border-input" />
            <input value={form.cor_marca || ""} onChange={(e) => setForm({ ...form, cor_marca: e.target.value })} className="i font-mono" />
          </div>
        </F>
        <button className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Salvar alterações</button>
      </form>
      <style>{`.i{width:100%;border:1px solid var(--input);background:var(--surface);padding:0.5rem 0.75rem;border-radius:0.375rem;font-size:0.875rem;outline:none}.i:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}
