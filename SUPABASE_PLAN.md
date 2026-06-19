# Plano de Migração — Supabase

## Status das Etapas
- [ ] Etapa 1 — Banco de dados (tabelas SQL)
- [ ] Etapa 2 — Autenticação (e-mail + Google)
- [ ] Etapa 3 — Substituir localStorage pelo Supabase
- [ ] Etapa 4 — Multi-tenant + deploy final

---

## Etapa 1 — Banco de dados

### Tabelas a criar no Supabase (SQL Editor)

```sql
-- 1. Oficinas (workshops)
create table workshops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cnpj text,
  owner text,
  whatsapp text,
  email text,
  city text,
  state text,
  plan text default 'starter',
  created_at timestamp with time zone default now()
);

-- 2. Clientes
create table customers (
  id uuid default gen_random_uuid() primary key,
  workshop_id uuid references workshops(id) on delete cascade,
  name text not null,
  cpf text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  created_at timestamp with time zone default now()
);

-- 3. Veículos
create table vehicles (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) on delete cascade,
  workshop_id uuid references workshops(id) on delete cascade,
  brand text,
  model text,
  year integer,
  plate text,
  color text,
  chassis text,
  mileage integer,
  notes text,
  created_at timestamp with time zone default now()
);

-- 4. Orçamentos
create table quotes (
  id uuid default gen_random_uuid() primary key,
  workshop_id uuid references workshops(id) on delete cascade,
  customer_id uuid references customers(id),
  vehicle_id uuid references vehicles(id),
  customer_name text,
  vehicle_info text,
  service_type text,
  problem_description text,
  labor_cost numeric default 0,
  total_value numeric default 0,
  estimated_days integer default 1,
  notes text,
  status text default 'rascunho',
  public_token text unique,
  created_at timestamp with time zone default now()
);

-- 5. Itens do orçamento
create table quote_items (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id) on delete cascade,
  description text,
  type text, -- 'peca' ou 'mao_de_obra'
  quantity integer default 1,
  unit_price numeric default 0,
  total numeric default 0
);

-- 6. Ordens de Serviço
create table service_orders (
  id uuid default gen_random_uuid() primary key,
  os_number text unique,
  workshop_id uuid references workshops(id) on delete cascade,
  quote_id uuid references quotes(id),
  customer_id uuid references customers(id),
  customer_name text,
  vehicle_id uuid references vehicles(id),
  vehicle_info text,
  service_type text,
  technician_name text,
  status text default 'recebido',
  entry_date date,
  expected_date date,
  completed_date date,
  total_value numeric default 0,
  notes text,
  created_at timestamp with time zone default now()
);

-- 7. Solicitações de financiamento
create table financing_requests (
  id uuid default gen_random_uuid() primary key,
  workshop_id uuid references workshops(id) on delete cascade,
  customer_id uuid references customers(id),
  quote_id uuid references quotes(id),
  customer_name text,
  service_type text,
  requested_amount numeric,
  installments integer,
  estimated_installment numeric,
  status text default 'novo',
  risk_level text,
  full_name text,
  cpf text,
  birth_date date,
  monthly_income numeric,
  profession text,
  has_income_proof boolean default false,
  has_credit_restriction text,
  terms_accepted boolean default false,
  shop_commission numeric,
  autocred_commission numeric,
  partner_name text,
  created_at timestamp with time zone default now()
);

-- 8. Contador de OS (para gerar OS-0001, OS-0002...)
create table os_counter (
  id integer primary key default 1,
  current_value integer default 0
);
insert into os_counter values (1, 0);
```

### Row Level Security (RLS) — rodar depois do SQL acima

```sql
-- Habilitar RLS em todas as tabelas
alter table workshops enable row level security;
alter table customers enable row level security;
alter table vehicles enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table service_orders enable row level security;
alter table financing_requests enable row level security;

-- Políticas: cada usuário vê só os dados da sua oficina
-- (implementar na Etapa 2, após configurar auth)
```

---

## Etapa 2 — Autenticação

### Arquivos a criar/modificar
- `src/lib/supabase.ts` — cliente Supabase
- `src/app/auth/login/page.tsx` — login real
- `src/app/auth/cadastro/page.tsx` — cadastro real
- `src/middleware.ts` — proteger rotas autenticadas
- `src/context/AuthContext.tsx` — contexto de sessão

### Variáveis de ambiente necessárias
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Etapa 3 — Substituir localStorage

### Arquivos a modificar
- `src/lib/store.ts` — trocar por chamadas Supabase
- `src/hooks/useStore.ts` — tornar async, usar Supabase client
- `src/app/clientes/page.tsx`
- `src/app/clientes/[id]/page.tsx`
- `src/app/veiculos/page.tsx`
- `src/app/orcamentos/page.tsx`
- `src/app/orcamentos/[id]/page.tsx`
- `src/app/orcamentos/novo/page.tsx`
- `src/app/ordens/page.tsx`
- `src/app/financiamento/page.tsx`
- `src/app/dashboard/page.tsx`

---

## Etapa 4 — Multi-tenant + deploy

- Configurar RLS policies no Supabase
- Adicionar workshop_id em todas as queries
- Configurar variáveis de ambiente no Vercel
- Testar com 2 contas diferentes

---

## Informações do projeto
- **GitHub:** https://github.com/yanviana100/autocred-oficina
- **Vercel:** https://autocred-oficina.vercel.app
- **Stack:** Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase
