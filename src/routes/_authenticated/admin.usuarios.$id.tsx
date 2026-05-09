import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAdmin } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/admin/usuarios/$id")({ component: DetalheUsuario });

function DetalheUsuario() {
  const isAdmin = useRequireAdmin();
  const { id } = Route.useParams();
  const [u, setU] = useState<any>(null);
  const [props, setProps] = useState<any[]>([]);
  const [clis, setClis] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => setU(data));
    supabase.from("propostas").select("id,numero,titulo,status,valor_total").eq("user_id", id).then(({ data }) => setProps(data ?? []));
    supabase.from("clientes").select("id,nome_empresa").eq("user_id", id).then(({ data }) => setClis(data ?? []));
  }, [id, isAdmin]);
  if (!isAdmin || !u) return null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{u.nome || u.email}</h1>
      <div className="rounded-xl border border-border bg-surface p-6 text-sm">
        <div>Email: {u.email}</div><div>Role: {u.role}</div><div>Status: {u.ativo ? "ativo" : "inativo"}</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-2 font-semibold">Propostas ({props.length})</h3>
        <ul className="text-sm">{props.map(p => <li key={p.id}>#{p.numero} · {p.titulo} · {p.status}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-2 font-semibold">Clientes ({clis.length})</h3>
        <ul className="text-sm">{clis.map(c => <li key={c.id}>{c.nome_empresa}</li>)}</ul>
      </div>
    </div>
  );
}
