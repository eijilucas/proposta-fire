import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/clausulas")({ component: Clausulas });

function Clausulas() {
  const isAdmin = useRequireAdmin();
  const [c, setC] = useState<any>(null);

  useEffect(() => { if (isAdmin) supabase.from("configuracoes_admin").select("*").eq("id", 1).maybeSingle().then(({ data }) => setC(data)); }, [isAdmin]);

  const salvar = async () => {
    const { error } = await supabase.from("configuracoes_admin").update({ ...c, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Cláusulas atualizadas");
  };

  if (!isAdmin || !c) return null;
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Cláusulas padrão</h1>
      <p className="text-sm text-muted-foreground">Esses textos vêm pré-preenchidos em toda nova proposta.</p>
      {(["clausula_lgpd", "clausula_garantia", "clausula_suporte", "condicoes_pagamento"] as const).map(k => (
        <div key={k}>
          <label className="mb-1 block text-sm font-medium capitalize">{k.replace(/_/g, " ")}</label>
          <textarea rows={4} value={c[k] || ""} onChange={(e) => setC({ ...c, [k]: e.target.value })} className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm" />
        </div>
      ))}
      <button onClick={salvar} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Salvar</button>
    </div>
  );
}
