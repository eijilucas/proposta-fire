import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Plus, FileText, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";
import { formatBRL, formatNumeroProposta, formatDate, statusClass, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, aceitas: 0, valor: 0, taxa: 0 });
  const [recentes, setRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
      const { data: mes } = await supabase.from("propostas").select("status,valor_total,created_at").eq("user_id", user.id).gte("created_at", start.toISOString());
      const total = mes?.length ?? 0;
      const aceitas = mes?.filter((p) => p.status === "aceita").length ?? 0;
      const valor = mes?.filter((p) => p.status === "aceita").reduce((s, p) => s + Number(p.valor_total || 0), 0) ?? 0;
      const enviadas = mes?.filter((p) => ["enviada","visualizada","aceita","recusada","expirada"].includes(p.status)).length ?? 0;
      const taxa = enviadas ? (aceitas / enviadas) * 100 : 0;
      setStats({ total, aceitas, valor, taxa });
      const { data: recs } = await supabase.from("propostas").select("id,numero,titulo,status,valor_total,data_emissao,clientes(nome_empresa)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      setRecentes(recs ?? []);
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: "Propostas no mês", value: stats.total, icon: FileText },
    { label: "Aceitas no mês", value: stats.aceitas, icon: CheckCircle2 },
    { label: "Valor fechado", value: formatBRL(stats.valor), icon: DollarSign },
    { label: "Taxa de fechamento", value: `${stats.taxa.toFixed(0)}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/propostas/nova" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Nova proposta</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between"><span className="text-xs font-medium uppercase text-muted-foreground">{c.label}</span><c.icon className="h-4 w-4 text-muted-foreground" /></div>
            <div className="mt-2 font-mono text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-semibold">Últimas propostas</h2>
          <Link to="/propostas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {loading ? <div className="p-8 text-center text-muted-foreground">Carregando...</div> :
          recentes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma proposta ainda.</p>
              <Link to="/propostas/nova" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Criar primeira proposta</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentes.map((p) => (
                <li key={p.id}>
                  <Link to="/propostas/$id" params={{ id: p.id }} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-muted-foreground">#{formatNumeroProposta(p.numero)}</span>
                      <div>
                        <div className="text-sm font-medium">{p.titulo}</div>
                        <div className="text-xs text-muted-foreground">{p.clientes?.nome_empresa} · {formatDate(p.data_emissao)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={statusClass[p.status]}>{statusLabel[p.status]}</span>
                      <span className="font-mono text-sm">{formatBRL(p.valor_total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </div>
    </div>
  );
}
