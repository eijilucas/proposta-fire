import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({ component: AdminDash });

function AdminDash() {
  const isAdmin = useRequireAdmin();
  const [s, setS] = useState({ users: 0, ativos: 0, novos: 0, propostas: 0, ticket: 0, taxa: 0 });

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { count: users } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const { count: ativos } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ativo", true);
      const last = new Date(); last.setDate(last.getDate() - 30);
      const { count: novos } = await supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", last.toISOString());
      const { data: props } = await supabase.from("propostas").select("status,valor_total");
      const propostas = props?.length ?? 0;
      const aceitas = props?.filter(p => p.status === "aceita") ?? [];
      const ticket = aceitas.length ? aceitas.reduce((a, p) => a + Number(p.valor_total || 0), 0) / aceitas.length : 0;
      const enviadas = props?.filter(p => p.status !== "rascunho").length ?? 0;
      const taxa = enviadas ? (aceitas.length / enviadas) * 100 : 0;
      setS({ users: users ?? 0, ativos: ativos ?? 0, novos: novos ?? 0, propostas, ticket, taxa });
    })();
  }, [isAdmin]);

  if (!isAdmin) return null;
  const cards = [
    { l: "Usuários", v: s.users }, { l: "Ativos", v: s.ativos }, { l: "Novos (30d)", v: s.novos },
    { l: "Propostas", v: s.propostas }, { l: "Ticket médio", v: formatBRL(s.ticket) }, { l: "Taxa de aceite", v: `${s.taxa.toFixed(0)}%` },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(c => (
          <div key={c.l} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs uppercase text-muted-foreground">{c.l}</div>
            <div className="mt-2 font-mono text-2xl font-semibold">{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
