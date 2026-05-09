import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({ component: CadastroPage });

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    // login imediato (auto confirm está ativado)
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (e2) { toast.error(e2.message); return; }
    toast.success("Conta criada! Vamos cadastrar sua empresa.");
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link>
        <h1 className="mt-3 text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Comece a gerar propostas profissionais.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input required type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
