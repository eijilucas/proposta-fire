import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({ component: Perfil });

function Perfil() {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState(profile?.nome || "");
  const [novaSenha, setNovaSenha] = useState("");

  const salvarNome = async () => {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ nome }).eq("id", profile.id);
    if (error) toast.error(error.message); else { toast.success("Nome atualizado"); refreshProfile(); }
  };

  const trocarSenha = async () => {
    if (!novaSenha) return;
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) toast.error(error.message); else { toast.success("Senha alterada"); setNovaSenha(""); }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>
      <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
        <div><label className="mb-1 block text-sm font-medium">Email</label><input disabled value={profile?.email || ""} className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground" /></div>
        <div><label className="mb-1 block text-sm font-medium">Nome</label>
          <div className="flex gap-2">
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="flex-1 rounded-md border border-input bg-surface px-3 py-2 text-sm" />
            <button onClick={salvarNome} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Salvar</button>
          </div>
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Alterar senha</h2>
        <div className="flex gap-2">
          <input type="password" placeholder="Nova senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="flex-1 rounded-md border border-input bg-surface px-3 py-2 text-sm" />
          <button onClick={trocarSenha} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Alterar</button>
        </div>
      </div>
      <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-error hover:bg-red-50"><LogOut className="h-4 w-4" /> Sair da conta</button>
    </div>
  );
}
