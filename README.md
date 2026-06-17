# AutoCred — Plataforma de Crédito Automotivo 🚗💳

> **Plataforma de distribuição de crédito para o setor de reparos automotivos.**
> Conecta oficinas mecânicas a parceiros financeiros para que clientes que não podem pagar à vista consigam aprovar crédito em minutos — e a oficina recebe o valor integral do serviço.

---

> ⚠️ **Aviso Legal**: Este sistema é uma plataforma de gestão e pré-triagem. Não realiza operações financeiras reais. Simulações são apenas estimativas. A aprovação de crédito depende de análise posterior por parceiro financeiro autorizado pelo Banco Central do Brasil.

---

## 🎯 Posicionamento

AutoCred **não é** um software de gestão de oficina.

AutoCred **é** um middleware financeiro entre oficinas mecânicas e instituições de crédito. O produto resolve um problema de distribuição: como chegar a um cliente que precisa de crédito no exato momento em que ele está na oficina, sem poder pagar.

**Objetivos do produto:**
1. Aumentar a receita das oficinas (mais reparos fechados)
2. Aumentar o ticket médio (clientes parcelam serviços maiores)
3. Reduzir reparos perdidos por falta de crédito
4. Conectar oficinas a parceiros financeiros
5. Gerar receita de comissão para o AutoCred

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação

```bash
cd ~/autocred-oficina
npm install
npm run dev
```

Acesse: **[http://localhost:3000](http://localhost:3000)**

### Login de demonstração
- **E-mail**: carlos@autoexpertsilva.com.br
- **Senha**: qualquer senha (modo demo)

---

## 📱 Telas disponíveis

### Públicas (sem login)
| Rota | Descrição |
|------|-----------|
| `/` | Landing page — proposta de valor, como funciona, pricing |
| `/auth/login` | Login da oficina |
| `/auth/cadastro` | Cadastro de nova oficina |
| `/orcamento/publico?token=XXX` | Página pública do orçamento para o cliente |

### Plataforma (dashboard)
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard executivo de crédito — KPIs, gráficos, fluxo ativo |
| `/simulador` | Simulador de financiamento com divisão de comissão |
| `/financiamento` | Solicitações de crédito + pré-análise |
| `/pipeline` | Kanban financeiro (6 colunas, drag & drop) |
| `/fluxo` | Fluxo de crédito visual (7 etapas) ⚠️ pendente |
| `/parceiros` | Rede de parceiros financeiros |
| `/clientes` | Gestão de clientes |
| `/orcamentos` | Lista e criação de orçamentos |
| `/veiculos` | Gestão de veículos |
| `/perfil` | Perfil da oficina com comissões ⚠️ pendente |
| `/admin` | Painel administrativo da plataforma |
| `/investidor` | Página de investimento (TAM/SAM/SOM, unit economics) ⚠️ pendente |

> ⚠️ Páginas marcadas como "pendente" ainda precisam ser implementadas.

---

## 💰 Modelo de receita

### SaaS (recorrente)
| Plano | Preço | Oficinas | MRR |
|-------|-------|---------|-----|
| Starter | R$99/mês | 81 | R$8.019 |
| Pro | R$249/mês | 38 | R$9.462 |
| Premium | R$499/mês | 15 | R$7.485 |
| **Total** | | **134** | **~R$28.450** |

### Comissão (transacional — principal)
- **6.5% sobre volume financiado**
  - 4.0% para a oficina parceira
  - 2.5% para o AutoCred
- Volume atual: R$4.28M → **R$64.3K/mês em comissão bruta**
- Projeção 500 oficinas: R$28M/mês → R$1.82M/mês em comissão

---

## 📊 Tração atual (dados demo)

| Métrica | Valor |
|---------|-------|
| Oficinas ativas | 134 |
| Volume financiado total | R$4.28M |
| Parceiros financeiros | 4 |
| Comissões geradas | R$64.312 |
| Taxa de aprovação | 67.2% |
| Ticket médio | R$3.240 |
| MRR SaaS | R$28.450 |

---

## 🏗 Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── auth/
│   │   ├── login/                 # Login
│   │   └── cadastro/              # Cadastro oficina
│   ├── dashboard/                 # Dashboard executivo de crédito
│   ├── simulador/                 # Simulador de financiamento
│   ├── financiamento/             # Solicitações de crédito
│   ├── pipeline/                  # Kanban financeiro
│   ├── parceiros/                 # Rede de parceiros
│   ├── fluxo/                     # ⚠️ Fluxo de crédito (pendente)
│   ├── perfil/                    # ⚠️ Perfil da oficina (pendente)
│   ├── investidor/                # ⚠️ Página investidor (pendente)
│   ├── admin/                     # Admin da plataforma
│   ├── clientes/                  # Gestão de clientes
│   ├── orcamentos/                # Gestão de orçamentos
│   ├── veiculos/                  # Gestão de veículos
│   └── orcamento/publico/         # Página pública do cliente
├── components/
│   ├── layout/                    # Sidebar, Header, DashboardLayout
│   └── ui/                        # Componentes base (shadcn/ui)
├── data/
│   └── mock.ts                    # Dados demo (15 clientes, 10 orçamentos, 5 parceiros)
├── lib/
│   └── utils.ts                   # Formatadores, cálculo de comissão, market data
└── types/
    └── index.ts                   # Tipos TypeScript completos
```

---

## 🗃 Banco de dados (Supabase)

Schema completo em `supabase/schema.sql`. Execute no SQL Editor do Supabase.

**11 tabelas:** `plans`, `workshops`, `users`, `subscriptions`, `customers`, `vehicles`, `quotes`, `quote_items`, `financing_simulations`, `financing_requests`, `admin_metrics`

Inclui: RLS por oficina, trigger de recálculo automático do total do orçamento, política de acesso público por token.

---

## 🔌 Stack

| Tecnologia | Uso |
|-----------|-----|
| [Next.js 14](https://nextjs.org/) App Router | Framework principal |
| TypeScript | Tipagem |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [Recharts](https://recharts.org/) | Gráficos |
| [Lucide React](https://lucide.dev/) | Ícones |
| [Radix UI](https://radix-ui.com/) | Componentes headless |
| [Supabase](https://supabase.com/) | DB + Auth (schema pronto) |

---

## 🔮 Próximos passos técnicos

1. **`/fluxo`** — Implementar visualização do fluxo de crédito em 7 etapas
2. **`/perfil`** — Perfil da oficina com histórico de comissões e gráfico mensal
3. **`/investidor`** — Página completa para pitch: TAM/SAM/SOM, unit economics, roadmap
4. **Supabase Auth** — Substituir mock por autenticação real
5. **Integração parceiros** — Webhook para envio de leads a parceiros
6. **WhatsApp** — Notificações via Evolution API
7. **Stripe** — Cobrança dos planos SaaS

---

## 📋 O que falta para demo ao investidor

- [ ] `/fluxo` — Fluxo visual de crédito (7 etapas com animação)
- [ ] `/perfil` — Perfil com histórico de comissões
- [ ] `/investidor` — Página dedicada ao pitch (TAM, unit economics, roadmap)
- [ ] Melhoria na página `/admin` (tabs operacional/financeiro/oficinas)
- [ ] Comissão visível nas cards de financiamento

---

## ⚖️ Disclaimer

Este software destina-se exclusivamente à gestão operacional de oficinas mecânicas e triagem informativa de clientes interessados em financiamento. Não constitui oferta de crédito, não opera como instituição financeira e não é regulado como tal. Qualquer operação de crédito real deve ser conduzida por instituição financeira devidamente autorizada pelo Banco Central do Brasil.
