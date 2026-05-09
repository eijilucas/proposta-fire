import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Share2, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">P</div>
            <span className="font-semibold">PropostaPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium hover:text-primary">Entrar</Link>
            <Link to="/cadastro" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">Criar conta</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Pare de mandar orçamento solto no WhatsApp</h1>
          <p className="mt-4 text-lg text-muted-foreground">Gere proposta profissional em PDF em 2 minutos e feche mais contratos de firewall.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate({ to: "/cadastro" })} className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover">
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate({ to: "/login" })} className="rounded-md border border-border bg-surface px-6 py-3 font-medium hover:bg-muted">Já tenho conta</button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="text-xs text-muted-foreground">Proposta</div>
              <div className="font-mono text-lg font-semibold">#0042</div>
            </div>
            <span className="badge-aceita">Aceita</span>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Instalação pfSense</span><span className="font-mono">R$ 600,00</span></div>
            <div className="flex justify-between"><span>VPN acesso remoto</span><span className="font-mono">R$ 400,00</span></div>
            <div className="flex justify-between"><span>Suporte mensal</span><span className="font-mono">R$ 250,00</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
            <span>Total</span><span className="font-mono text-primary">R$ 1.250,00</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {[
          { icon: FileText, title: "Proposta profissional", desc: "PDF com sua marca, cláusulas LGPD e estrutura comercial pronta." },
          { icon: Share2, title: "Link público de aceite", desc: "Cliente recebe link, visualiza e aceita online em poucos cliques." },
          { icon: CheckCircle2, title: "Controle de status", desc: "Acompanhe enviadas, visualizadas, aceitas e expiradas automaticamente." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-6">
            <f.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PropostaPro
      </footer>
    </div>
  );
}
