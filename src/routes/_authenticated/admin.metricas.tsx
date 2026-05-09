import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/admin/metricas")({ component: Metricas });

function Metricas() {
  const isAdmin = useRequireAdmin();
  const [data, setData] = useState<{ dia: string; qtd: number }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const start = new Date(); start.setDate(start.getDate() - 30);
      const { data: rows } = await supabase.from("propostas").select("created_at").gte("created_at", start.toISOString());
      const map: Record<string, number> = {};
      rows?.forEach((r: any) => { const d = r.created_at.slice(0, 10); map[d] = (map[d] || 0) + 1; });
      setData(Object.entries(map).sort().map(([dia, qtd]) => ({ dia, qtd })));
    })();
  }, [isAdmin]);

  if (!isAdmin) return null;
  const max = Math.max(1, ...data.map(d => d.qtd));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Métricas de uso</h1>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-3 font-semibold">Propostas criadas (últimos 30 dias)</h3>
        <div className="flex h-48 items-end gap-1">
          {data.map(d => (
            <div key={d.dia} className="flex-1 rounded-t bg-primary/70" style={{ height: `${(d.qtd / max) * 100}%` }} title={`${d.dia}: ${d.qtd}`} />
          ))}
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground">Sem dados ainda.</p>}
      </div>
    </div>
  );
}
