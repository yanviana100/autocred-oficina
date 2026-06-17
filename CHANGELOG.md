# CHANGELOG — AutoCred

Todas as mudanças relevantes do projeto estão documentadas aqui.

---

## [0.3.0] — 2024-06-17 — Transformação Investor-Ready (em andamento)

### Reposicionamento estratégico
O produto foi reposicionado de **software de gestão de oficinas** para **plataforma de distribuição de crédito para o setor automotivo**. Toda a linguagem, navegação e KPIs foram atualizados para refletir essa visão.

### Adicionado

#### Novas páginas
- `src/app/page.tsx` — Landing page completa (substituiu redirecionamento simples)
  - Hero com proposta de valor clara
  - Seção do problema (38% abandono, R$33B perdidos, 550k oficinas)
  - Como funciona (3 passos)
  - Benefícios para oficinas (6 cards)
  - Oportunidade de mercado TAM/SAM/SOM
  - Benefícios para parceiros financeiros
  - Pricing (Starter/Pro/Premium)
  - CTA final
- `src/app/simulador/page.tsx` — Simulador standalone de financiamento
  - Inputs: valor do reparo, entrada, parcelas, taxa, parceiro
  - Resultado em tempo real: parcela, juros, CET
  - Divisão de receita: comissão oficina (4%) + AutoCred (2.5%)
  - Tabela comparativa de cenários
- `src/app/parceiros/page.tsx` — Rede de parceiros financeiros
  - Cards de cada parceiro com produtos, taxas, capacidade
  - Como funciona a parceria (4 passos)
  - CTA para novos parceiros

#### Páginas pendentes (a implementar)
- `src/app/fluxo/page.tsx` — Fluxo de crédito visual (7 etapas)
- `src/app/investidor/page.tsx` — Página para investidores (TAM/SAM/SOM, unit economics, roadmap)
- `src/app/perfil/page.tsx` — Perfil da oficina com histórico de comissões

### Modificado

#### Dados e tipos
- `src/types/index.ts` — Expandido com:
  - `FinancingPartner` e `FinancingProduct` (rede de parceiros)
  - Campos de comissão em `FinancingRequest` (`shopCommission`, `autocredCommission`, `partnerName`)
  - `CreditFlowStep` (fluxo de crédito)
  - Campos de perfil em `Workshop` (`monthlyVolume`, `totalFinanced`, `totalCommission`, `approvalRate`, `avgTicket`)
- `src/data/mock.ts` — Completamente reescrito com dados realistas:
  - 15 clientes (era 5) com CPFs brasileiros reais
  - 15 veículos (era 6)
  - 10 orçamentos (era 5) com valores maiores e mais realistas
  - 10 solicitações de financiamento (era 4) com comissões calculadas
  - 5 parceiros financeiros: Santander, Creditas, Banco Inter, Sicoob, BV
  - `platformMonthlyData` — crescimento da plataforma Jan→Jun 2024
  - `mockCreditFlow` — fluxo ativo de demonstração (7 etapas)
  - `mockAdminMetrics` — atualizado: 134 oficinas, R$4.28M financiado, R$64.3K comissão
  - `mockAllWorkshops` — 10 oficinas (era 5) com métricas completas
- `src/lib/utils.ts` — Expandido com:
  - `formatCurrencyShort()` — formato compacto (R$4.2M, R$28K)
  - `formatPercent()` — formatação de porcentagem
  - `formatDateFull()` — data por extenso
  - `calculateCommissions()` — cálculo de comissão (SHOP: 4%, AUTOCRED: 2.5%)
  - `SHOP_COMMISSION_RATE`, `AUTOCRED_COMMISSION_RATE`, `TOTAL_COMMISSION_RATE` — constantes
  - `marketData` — dados de mercado (TAM R$87B, SAM R$8.7B, SOM R$87M, 550k oficinas)
  - `planPrice` — preços por plano
  - `quoteStatusColor` — adicionado status `pre_aprovado`
- `src/components/layout/Sidebar.tsx` — Reescrito:
  - Logo: CreditCard (era Wrench) + "Crédito Automotivo" (era "Oficina")
  - Seção "CRÉDITO": Dashboard, Fluxo de Crédito, Pipeline, Solicitações, Simulador
  - Seção "GESTÃO": Clientes, Orçamentos, Veículos
  - Seção "PLATAFORMA": Parceiros, Minha Oficina, Admin, Para Investidores (destaque âmbar)
  - Exibe comissão acumulada (R$14.448) no bloco da oficina
- `src/app/dashboard/page.tsx` — Reescrito como Dashboard Executivo de Crédito:
  - 8 KPIs: solicitações, aprovação, volume, ticket médio, SaaS, comissão, oficinas na rede, conversão
  - Gráfico de área: volume financiado + comissão mensal
  - Gráfico de barras: financiamentos vs aprovados
  - Mini stepper do fluxo de crédito ativo
  - Tabela de solicitações recentes com CPF mascarado
  - Ações rápidas (simulador, pipeline, parceiros)
- `src/app/globals.css` — Adicionado:
  - `.fintech-gradient` — gradiente escuro premium
  - `.card-hover` — efeito hover suave nos cards
  - `.step-active` — animação de pulso para etapa ativa do fluxo
- `src/app/auth/login/page.tsx` — Adicionado link "← Voltar ao site" para a landing page

---

## [0.2.0] — 2024-06-16 — Correção de build e instalação

### Corrigido
- Removido `@radix-ui/react-badge` (pacote inexistente no npm) do `package.json`
- Renomeado `next.config.ts` → `next.config.mjs` (Next.js 14 não suporta `.ts`)
- Adicionado `Suspense` wrapper em `src/app/orcamento/publico/page.tsx` (requisito do `useSearchParams` no App Router)
- Build passa 100% limpo (`npm run build` exitcode 0)

---

## [0.1.0] — 2024-06-15 — MVP inicial

### Adicionado (MVP completo funcional)

#### Autenticação
- `src/app/auth/login/page.tsx` — Tela de login com credenciais demo
- `src/app/auth/cadastro/page.tsx` — Cadastro de nova oficina (7 campos)

#### Dashboard
- `src/app/dashboard/page.tsx` — Dashboard com métricas, gráfico, orçamentos recentes

#### Gestão de oficina
- `src/app/clientes/page.tsx` — Lista e cadastro de clientes
- `src/app/veiculos/page.tsx` — Lista e cadastro de veículos
- `src/app/orcamentos/page.tsx` — Lista de orçamentos com filtros
- `src/app/orcamentos/novo/page.tsx` — Criação de orçamento com itens dinâmicos
- `src/app/orcamentos/[id]/page.tsx` — Detalhe + simulador de financiamento
- `src/app/financiamento/page.tsx` — Pré-análise de crédito + lista de solicitações
- `src/app/pipeline/page.tsx` — Kanban financeiro com drag & drop (6 colunas)
- `src/app/admin/page.tsx` — Painel administrativo da plataforma
- `src/app/orcamento/publico/page.tsx` — Página pública do orçamento para o cliente

#### Layout e componentes
- `src/components/layout/Sidebar.tsx` — Sidebar colapsável
- `src/components/layout/Header.tsx` — Header com busca e perfil
- `src/components/layout/DashboardLayout.tsx` — Layout base
- `src/components/ui/` — Componentes base: button, card, badge, input, label, select, separator, tabs, textarea

#### Infraestrutura
- `src/types/index.ts` — Tipos TypeScript completos
- `src/data/mock.ts` — Dados mockados
- `src/lib/utils.ts` — Utilitários e formatadores
- `supabase/schema.sql` — Schema completo (11 tabelas, RLS, triggers)
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
