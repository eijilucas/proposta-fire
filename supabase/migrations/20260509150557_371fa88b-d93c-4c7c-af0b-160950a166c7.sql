
-- =========================================================
-- PROFILES + role trigger
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nome text,
  role text not null default 'user' check (role in ('admin','user')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_admin(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = _uid and role = 'admin' and ativo = true);
$$;

create policy "profiles self select" on public.profiles for select using (auth.uid() = id);
create policy "profiles admin select" on public.profiles for select using (public.is_admin(auth.uid()));
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles admin update" on public.profiles for update using (public.is_admin(auth.uid()));
create policy "profiles admin delete" on public.profiles for delete using (public.is_admin(auth.uid()));
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare admin_exists boolean; user_role text;
begin
  select exists(select 1 from public.profiles where role = 'admin') into admin_exists;
  user_role := case when admin_exists then 'user' else 'admin' end;
  insert into public.profiles (id, email, nome, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome',''), user_role);
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- DADOS_EMPRESA
-- =========================================================
create table public.dados_empresa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  nome_empresa text not null,
  cnpj_ou_mei text,
  nome_responsavel text not null,
  telefone text,
  email_contato text,
  endereco text,
  cidade text,
  estado text,
  logo_url text,
  cor_marca text default '#0F4C75',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.dados_empresa enable row level security;
create policy "empresa own" on public.dados_empresa for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "empresa admin" on public.dados_empresa for all using (public.is_admin(auth.uid()));

-- =========================================================
-- CLIENTES
-- =========================================================
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome_empresa text not null,
  nome_responsavel text,
  cnpj text,
  email text,
  telefone text,
  endereco text,
  cidade text,
  tipo_negocio text,
  qtd_computadores integer,
  observacoes text,
  created_at timestamptz default now()
);
alter table public.clientes enable row level security;
create policy "clientes own" on public.clientes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "clientes admin" on public.clientes for all using (public.is_admin(auth.uid()));

-- =========================================================
-- SERVICOS_CATALOGO
-- =========================================================
create table public.servicos_catalogo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao_padrao text,
  unidade text check (unidade in ('por_servico','por_hora','por_mes')),
  valor_sugerido numeric default 0,
  inclui_lgpd boolean default false,
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table public.servicos_catalogo enable row level security;
create policy "catalogo read auth" on public.servicos_catalogo for select to authenticated using (true);
create policy "catalogo admin write" on public.servicos_catalogo for insert with check (public.is_admin(auth.uid()));
create policy "catalogo admin update" on public.servicos_catalogo for update using (public.is_admin(auth.uid()));
create policy "catalogo admin delete" on public.servicos_catalogo for delete using (public.is_admin(auth.uid()));

-- =========================================================
-- PROPOSTAS
-- =========================================================
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  numero integer not null,
  titulo text not null,
  data_emissao date default current_date,
  validade_dias integer default 7,
  prazo_execucao text,
  clausula_lgpd text,
  clausula_garantia text,
  clausula_suporte text,
  condicoes_pagamento text,
  observacoes text,
  status text not null default 'rascunho' check (status in ('rascunho','enviada','visualizada','aceita','recusada','expirada')),
  valor_total numeric default 0,
  link_publico_token text not null unique default encode(gen_random_bytes(16),'hex'),
  aceita_em timestamptz,
  aceita_nome text,
  recusada_em timestamptz,
  motivo_recusa text,
  visualizada_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, numero)
);
alter table public.propostas enable row level security;
create policy "propostas own" on public.propostas for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "propostas admin" on public.propostas for all using (public.is_admin(auth.uid()));
-- public select via token: handled by RPC (no public RLS exposing other rows)

-- =========================================================
-- PROPOSTA_ITENS
-- =========================================================
create table public.proposta_itens (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references public.propostas(id) on delete cascade,
  servico_catalogo_id uuid references public.servicos_catalogo(id) on delete set null,
  nome text not null,
  descricao text,
  unidade text check (unidade in ('por_servico','por_hora','por_mes')),
  quantidade numeric default 1,
  valor_unitario numeric not null default 0,
  valor_total_item numeric default 0,
  ordem integer default 0
);
alter table public.proposta_itens enable row level security;
create policy "itens own" on public.proposta_itens for all
  using (exists(select 1 from public.propostas p where p.id = proposta_id and p.user_id = auth.uid()))
  with check (exists(select 1 from public.propostas p where p.id = proposta_id and p.user_id = auth.uid()));
create policy "itens admin" on public.proposta_itens for all using (public.is_admin(auth.uid()));

-- =========================================================
-- CONFIGURACOES_ADMIN (cláusulas padrão)
-- =========================================================
create table public.configuracoes_admin (
  id integer primary key default 1,
  clausula_lgpd text default '',
  clausula_garantia text default '',
  clausula_suporte text default '',
  condicoes_pagamento text default '',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
alter table public.configuracoes_admin enable row level security;
create policy "config read" on public.configuracoes_admin for select to authenticated using (true);
create policy "config admin write" on public.configuracoes_admin for all using (public.is_admin(auth.uid()));
insert into public.configuracoes_admin (id, clausula_lgpd, clausula_garantia, clausula_suporte, condicoes_pagamento)
values (1,
'O CONTRATADO compromete-se a tratar todos os dados pessoais aos quais tiver acesso em conformidade com a Lei nº 13.709/2018 (LGPD), garantindo confidencialidade, integridade e finalidade adequada do tratamento.',
'Os serviços executados possuem garantia de 90 (noventa) dias contados da data de entrega, cobrindo defeitos de configuração ou execução. Não cobre alterações realizadas por terceiros.',
'O suporte técnico será prestado em horário comercial (segunda a sexta, das 9h às 18h), com tempo de resposta de até 4 horas úteis para incidentes críticos.',
'Pagamento à vista via PIX ou transferência em até 5 dias úteis após a aceitação. Para serviços recorrentes, cobrança mensal no 5º dia útil.');

-- =========================================================
-- SEED servicos_catalogo
-- =========================================================
insert into public.servicos_catalogo (nome, descricao_padrao, unidade, valor_sugerido, inclui_lgpd) values
('Instalação de firewall pfSense em PME','Instalação completa do firewall pfSense, incluindo configuração de interfaces de rede, regras de NAT, regras de firewall, bloqueio de portas críticas e validação da conectividade. Adequado para empresas com 5 a 30 dispositivos.','por_servico',600,true),
('Configuração de regras avançadas de firewall','Implementação de regras adicionais conforme necessidade do cliente: VLANs, controle por horário, bloqueio de categorias, regras por usuário.','por_servico',350,false),
('Suporte mensal de monitoramento de rede','Acompanhamento mensal da rede do cliente com verificação de logs do firewall, atualização de regras conforme necessidade, suporte remoto a incidentes em até 4 horas úteis.','por_mes',250,false),
('Configuração de VPN para acesso remoto','Configuração de VPN no firewall para acesso seguro de funcionários e parceiros à rede da empresa.','por_servico',400,true),
('Auditoria de segurança de rede','Análise completa da rede atual, identificação de vulnerabilidades, relatório com recomendações priorizadas.','por_servico',500,true),
('Backup automatizado em servidor local','Configuração de rotina de backup diário, semanal e mensal com retenção configurável.','por_servico',350,false),
('Suporte avulso por hora técnica','Atendimento técnico avulso para resolução de incidentes pontuais.','por_hora',120,false),
('Treinamento de boas práticas de segurança para funcionários','Sessão de 2 horas com a equipe do cliente sobre senhas seguras, phishing, uso adequado de email e redes sociais.','por_servico',400,false);

-- =========================================================
-- RPC: get proposta by public token (bypass RLS safely)
-- =========================================================
create or replace function public.get_proposta_publica(_token text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_proposta propostas%rowtype;
  v_cliente clientes%rowtype;
  v_empresa dados_empresa%rowtype;
  v_itens json;
begin
  select * into v_proposta from propostas where link_publico_token = _token;
  if not found then return null; end if;

  -- expira se passou da validade
  if v_proposta.status in ('enviada','visualizada')
     and (v_proposta.data_emissao + v_proposta.validade_dias) < current_date then
    update propostas set status = 'expirada' where id = v_proposta.id;
    v_proposta.status := 'expirada';
  end if;

  -- marca como visualizada
  if v_proposta.status = 'enviada' then
    update propostas set status='visualizada', visualizada_em=now() where id = v_proposta.id;
    v_proposta.status := 'visualizada';
    v_proposta.visualizada_em := now();
  end if;

  select * into v_cliente from clientes where id = v_proposta.cliente_id;
  select * into v_empresa from dados_empresa where user_id = v_proposta.user_id;
  select coalesce(json_agg(row_to_json(i.*) order by i.ordem),'[]'::json) into v_itens
    from proposta_itens i where i.proposta_id = v_proposta.id;

  return json_build_object('proposta',row_to_json(v_proposta),'cliente',row_to_json(v_cliente),'empresa',row_to_json(v_empresa),'itens',v_itens);
end; $$;

grant execute on function public.get_proposta_publica(text) to anon, authenticated;

-- =========================================================
-- RPC: aceitar / recusar
-- =========================================================
create or replace function public.aceitar_proposta(_token text, _nome text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update propostas set status='aceita', aceita_em=now(), aceita_nome=_nome
   where link_publico_token = _token and status in ('enviada','visualizada');
end; $$;
grant execute on function public.aceitar_proposta(text, text) to anon, authenticated;

create or replace function public.recusar_proposta(_token text, _motivo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update propostas set status='recusada', recusada_em=now(), motivo_recusa=_motivo
   where link_publico_token = _token and status in ('enviada','visualizada');
end; $$;
grant execute on function public.recusar_proposta(text, text) to anon, authenticated;

-- =========================================================
-- RPC: próximo número da proposta para usuário
-- =========================================================
create or replace function public.proximo_numero_proposta()
returns integer language plpgsql security definer set search_path = public as $$
declare v_max integer;
begin
  select coalesce(max(numero),0)+1 into v_max from propostas where user_id = auth.uid();
  return v_max;
end; $$;
grant execute on function public.proximo_numero_proposta() to authenticated;

-- =========================================================
-- Trigger: recalcular valor_total_item e valor_total da proposta
-- =========================================================
create or replace function public.calc_item_total()
returns trigger language plpgsql as $$
begin
  new.valor_total_item := coalesce(new.quantidade,0) * coalesce(new.valor_unitario,0);
  return new;
end; $$;
create trigger trg_calc_item before insert or update on public.proposta_itens
for each row execute procedure public.calc_item_total();

create or replace function public.recalc_proposta_total()
returns trigger language plpgsql as $$
declare v_id uuid;
begin
  v_id := coalesce(new.proposta_id, old.proposta_id);
  update propostas set valor_total = (select coalesce(sum(valor_total_item),0) from proposta_itens where proposta_id = v_id),
                       updated_at = now()
   where id = v_id;
  return null;
end; $$;
create trigger trg_recalc_total after insert or update or delete on public.proposta_itens
for each row execute procedure public.recalc_proposta_total();

-- =========================================================
-- STORAGE bucket para logos
-- =========================================================
insert into storage.buckets (id, name, public) values ('logos','logos',true) on conflict do nothing;
create policy "logos read" on storage.objects for select using (bucket_id = 'logos');
create policy "logos auth insert" on storage.objects for insert to authenticated with check (bucket_id = 'logos');
create policy "logos auth update" on storage.objects for update to authenticated using (bucket_id = 'logos');
create policy "logos auth delete" on storage.objects for delete to authenticated using (bucket_id = 'logos');
