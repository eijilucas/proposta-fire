import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({ component: Onboarding });

function Onboarding() {
  const { user, refreshProfile, hasEmpresa } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome_empresa: "", cnpj_ou_mei: "", nome_responsavel: "",
    telefone: "", email_contato: "", endereco: "", cidade: "", estado: "",
    cor_marca: "#0F4C75",
  });

  useEffect(() => { if (hasEmpresa) navigate({ to: "/dashboard" }); }, [hasEmpresa, navigate]);

  const onLogo = (f: File) => {
    setLogoFile(f);
    const r = new FileReader();
    r.onload = () => setLogoPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    let logo_url: string | null = null;
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
      if (upErr) { toast.error("Falha no upload da logo"); }
      else logo_url = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("dados_empresa").insert({ ...form, logo_url, user_id: user.id });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Empresa cadastrada!");
    await refreshProfile();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Antes de começar, vamos cadastrar os dados da sua empresa.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Esses dados aparecerão nas suas propostas.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6">
        <Field label="Nome da empresa *"><input required value={form.nome_empresa} onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })} className="input" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="CNPJ ou MEI"><input value={form.cnpj_ou_mei} onChange={(e) => setForm({ ...form, cnpj_ou_mei: e.target.value })} className="input font-mono" /></Field>
          <Field label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Nome do responsável *"><input required value={form.nome_responsavel} onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })} className="input" /></Field>
        <Field label="Email de contato"><input type="email" value={form.email_contato} onChange={(e) => setForm({ ...form, email_contato: e.target.value })} className="input" /></Field>
        <Field label="Endereço"><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="input" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cidade"><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="input" /></Field>
          <Field label="Estado"><input maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} className="input" /></Field>
        </div>
        <Field label="Logo">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 hover:bg-muted">
            {logoPreview ? <img src={logoPreview} alt="logo" className="h-20 object-contain" /> : <><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Clique para enviar a logo</span></>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])} />
          </label>
        </Field>
        <Field label="Cor da marca">
          <div className="flex items-center gap-3">
            <input type="color" value={form.cor_marca} onChange={(e) => setForm({ ...form, cor_marca: e.target.value })} className="h-10 w-16 rounded border border-input" />
            <input value={form.cor_marca} onChange={(e) => setForm({ ...form, cor_marca: e.target.value })} className="input font-mono" />
          </div>
        </Field>
        <button disabled={loading} className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {loading ? "Salvando..." : "Salvar e continuar"}
        </button>
      </form>
      <style>{`.input{width:100%;border:1px solid var(--input);background:var(--surface);padding:0.5rem 0.75rem;border-radius:0.375rem;font-size:0.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}
