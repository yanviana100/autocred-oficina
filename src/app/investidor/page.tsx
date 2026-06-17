"use client";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, DollarSign, Users, Zap, CheckCircle, AlertTriangle,
  ArrowRight, CreditCard, Building2, BarChart2, Target,
} from "lucide-react";
import { marketData, formatCurrencyShort, formatCurrency } from "@/lib/utils";
import { platformMonthlyData } from "@/data/mock";

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

const revenueProjection = [
  { ano: "2024", mrr: 28450,  comissao: 64312,  oficinas: 134,  volume: 4_280_000  },
  { ano: "2025", mrr: 94500,  comissao: 245000,  oficinas: 500,  volume: 18_000_000 },
  { ano: "2026", mrr: 249000, comissao: 820000,  oficinas: 1500, volume: 62_000_000 },
  { ano: "2027", mrr: 598000, comissao: 2450000, oficinas: 4000, volume: 182_000_000},
];

const unitEconomics = {
  cac: 380,
  ltv: 19752,
  ltvCacRatio: 51.97,
  paybackMonths: 1.8,
  arpu: 312,
  churnRate: 1.6,
};

const roadmap = [
  { quarter: "Q3 2024", status: "done",    items: ["MVP lançado", "10 oficinas piloto", "4 parceiros financeiros", "Build limpo + CI"] },
  { quarter: "Q4 2024", status: "active",  items: ["Seed round R$2.5M", "Expansão SP (100 oficinas)", "App mobile (React Native)", "WhatsApp notifications"] },
  { quarter: "Q1 2025", status: "planned", items: ["Integração Santander API", "Score de risco proprietário", "500 oficinas ativas", "Desk de crédito interno"] },
  { quarter: "Q2 2025", status: "planned", items: ["Expansão nacional (RJ, MG, PR)", "Open Finance integration", "Marketplace de seguros", "Series A prep"] },
];

const teamMembers = [
  { name: "Carlos Silva", role: "CEO & Co-founder", bg: "Fintech + 10 anos setor automotivo" },
  { name: "Ana Rodrigues", role: "CTO & Co-founder", bg: "Engenharia — ex-Nubank, ex-iFood" },
  { name: "Marcos Lima", role: "CFO", bg: "Crédito — ex-BV Financeira, ex-Creditas" },
];

const asks = [
  { label: "Produto & Tecnologia", pct: 40, value: 1_000_000 },
  { label: "Crescimento & Sales", pct: 35, value: 875_000 },
  { label: "Operações & CS",      pct: 15, value: 375_000 },
  { label: "Reserva legal",       pct: 10, value: 250_000 },
];

export default function InvestidorPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white text-sm">AutoCred</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Investor Deck</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Site público</Link>
            <Link href="/dashboard">
              <button className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                Ver demo
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="fintech-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">Seed Round — 2024</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            O banco das oficinas.<br />
            <span className="text-blue-400">R$33 bilhões</span> esperando.
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AutoCred é um marketplace de crédito automotivo que conecta as 550.000 oficinas
            mecânicas do Brasil a parceiros financeiros — em menos de 2 horas.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-white">R$2,5M</p>
              <p className="text-xs text-slate-400 mt-0.5">Captação seed</p>
            </div>
            <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-emerald-400">R$87B</p>
              <p className="text-xs text-slate-400 mt-0.5">TAM total</p>
            </div>
            <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-blue-400">51,97×</p>
              <p className="text-xs text-slate-400 mt-0.5">LTV/CAC</p>
            </div>
            <div className="flex flex-col items-center px-6 py-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-yellow-400">1,8 meses</p>
              <p className="text-xs text-slate-400 mt-0.5">Payback CAC</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">

        {/* PROBLEMA */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">O problema</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">R$33 bilhões em reparos perdidos todo ano</h2>
          <p className="text-slate-500 max-w-xl mb-10">
            38% dos clientes de oficinas mecânicas abandonam o reparo por não conseguir pagar à vista.
            Não existe hoje uma solução digital que resolve isso no ponto de venda.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle, color: "text-red-500 bg-red-50",
                title: "38% de abandono",
                desc: "Mais de 1 em cada 3 clientes desiste do reparo por falta de crédito. Isso é receita que simplesmente desaparece.",
              },
              {
                icon: TrendingUp, color: "text-amber-500 bg-amber-50",
                title: "Processo manual e lento",
                desc: "Quando a oficina tenta oferecer crédito, o processo leva 3–5 dias com bancos tradicionais. O cliente não espera.",
              },
              {
                icon: Users, color: "text-slate-500 bg-slate-50",
                title: "550k oficinas desatendidas",
                desc: "Nenhuma fintech brasileira oferece crédito automotivo no ponto de serviço. É um mercado virgem.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TAM / SAM / SOM */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Oportunidade de mercado</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-10">TAM / SAM / SOM</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: "TAM — Mercado total",
                value: formatCurrencyShort(marketData.tam),
                desc: "Mercado de reparos automotivos no Brasil. +550k oficinas, 38% sem acesso a crédito.",
                color: "border-blue-200 bg-blue-50",
                badge: "bg-blue-600 text-white",
              },
              {
                label: "SAM — Mercado endereçável",
                value: formatCurrencyShort(marketData.samMarket),
                desc: "10% do TAM. Oficinas com acesso a internet e dispostas a adotar fintech (≈55k oficinas).",
                color: "border-emerald-200 bg-emerald-50",
                badge: "bg-emerald-600 text-white",
              },
              {
                label: "SOM — Alvo em 3 anos",
                value: formatCurrencyShort(marketData.som),
                desc: "1% de penetração no SAM com 4.000 oficinas ativas e R$182M/ano em volume financiado.",
                color: "border-amber-200 bg-amber-50",
                badge: "bg-amber-500 text-white",
              },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border-2 p-6 ${m.color}`}>
                <p className="text-xs font-semibold text-slate-500 mb-2">{m.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 mb-3">{m.value}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <ResponsiveContainer width={360} height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: "TAM", value: 87 },
                    { name: "SAM", value: 8.7 },
                    { name: "SOM", value: 0.087 },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value"
                >
                  {["#2563eb", "#10b981", "#f59e0b"].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `R$${v}B`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SOLUÇÃO */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">A solução</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Crédito aprovado em &lt; 2 horas, no balcão da oficina</h2>
          <p className="text-slate-500 max-w-xl mb-10 leading-relaxed">
            AutoCred é um SaaS para oficinas que funciona como um distribuidor de crédito white-label.
            A oficina cadastra o cliente, AutoCred faz a triagem e encaminha ao parceiro financeiro ideal.
            O reparo começa. A oficina recebe o valor integral.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", icon: Users,      title: "Cliente chega",       desc: "Com orçamento em mão, sem dinheiro para pagar à vista" },
              { step: "2", icon: BarChart2,  title: "Triagem instantânea", desc: "AutoCred analisa perfil e risco em segundos" },
              { step: "3", icon: Building2,  title: "Parceiro ideal",      desc: "Sistema encaminha ao banco com maior probabilidade de aprovação" },
              { step: "4", icon: CheckCircle,title: "Aprovado < 2h",       desc: "Oficina autoriza reparo. Recebe da financeira. Ganha comissão." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-3">{s.step}</div>
                <s.icon className="w-4 h-4 text-blue-500 mb-2" />
                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MODELO DE RECEITA */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Modelo de receita</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Duas receitas, ambas crescendo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-xl border-2 border-blue-200 p-6">
              <Zap className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">SaaS Recorrente</h3>
              <p className="text-sm text-slate-500 mb-4">Assinatura mensal por oficina — MRR previsível e escalável.</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b pb-1">
                    <th className="pb-2">Plano</th><th className="pb-2">Preço</th><th className="pb-2">Oficinas</th><th className="pb-2">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { p: "Starter", price: "R$99", n: 81,  mrr: "R$8.019" },
                    { p: "Pro",     price: "R$249", n: 38, mrr: "R$9.462" },
                    { p: "Premium", price: "R$499", n: 15, mrr: "R$7.485" },
                  ].map((r) => (
                    <tr key={r.p}>
                      <td className="py-1.5 font-medium">{r.p}</td>
                      <td className="py-1.5 text-slate-600">{r.price}</td>
                      <td className="py-1.5 text-slate-600">{r.n}</td>
                      <td className="py-1.5 font-semibold text-blue-700">{r.mrr}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="pt-2" colSpan={2}>Total</td>
                    <td className="pt-2">134</td>
                    <td className="pt-2 text-blue-700">R$28.450</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border-2 border-emerald-200 p-6">
              <DollarSign className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-2">Comissão Transacional</h3>
              <p className="text-sm text-slate-500 mb-4">2,5% de comissão sobre cada financiamento aprovado. Escala com volume.</p>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Volume atual / mês", value: "R$4,28M", color: "text-slate-900" },
                  { label: "Comissão AutoCred (2,5%)", value: "R$64.312", color: "text-emerald-700" },
                  { label: "Comissão oficina (4%)", value: "R$171.200", color: "text-blue-700" },
                  { label: "Total comissão (6,5%)", value: "R$278.200", color: "text-slate-700" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between border-b last:border-0 pb-2">
                    <span className="text-slate-500">{r.label}</span>
                    <span className={`font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TRAÇÃO + GRÁFICO */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Tração</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Crescimento orgânico em 6 meses</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Oficinas ativas",    value: "134",     sub: "jan → jun 2024" },
              { label: "Volume financiado",  value: "R$4,28M", sub: "6 meses acumulado" },
              { label: "Taxa de aprovação",  value: "67,2%",   sub: "acima do mercado" },
              { label: "MRR",               value: "R$28.450", sub: "+18% m/m" },
            ].map((t) => (
              <div key={t.label} className="rounded-xl border p-4 text-center">
                <p className="text-2xl font-extrabold text-slate-900">{t.value}</p>
                <p className="text-xs text-slate-500 mt-1">{t.label}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{t.sub}</p>
              </div>
            ))}
          </div>
          <Card className="rounded-xl border p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Volume financiado mensal (R$)</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={platformMonthlyData}>
                <defs>
                  <linearGradient id="gVol2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="volume" name="Volume" stroke="#2563eb" fill="url(#gVol2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* PROJEÇÃO */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Projeção financeira</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Caminho para R$2,5M/mês de receita</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Ano", "Oficinas", "Volume anual", "MRR SaaS", "Comissão / mês", "Receita total / mês"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {revenueProjection.map((r) => (
                  <tr key={r.ano} className={r.ano === "2024" ? "bg-blue-50" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.ano}</td>
                    <td className="px-4 py-3">{r.oficinas.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrencyShort(r.volume)}</td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">{formatCurrency(r.mrr)}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">{formatCurrency(r.comissao)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(r.mrr + r.comissao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* UNIT ECONOMICS */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Unit economics</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Matemática que funciona</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "CAC",          value: formatCurrency(unitEconomics.cac),              sub: "custo de aquisição por oficina",   color: "border-red-200 bg-red-50"     },
              { label: "LTV",          value: formatCurrency(unitEconomics.ltv),              sub: "LTV em 5 anos por oficina",        color: "border-blue-200 bg-blue-50"   },
              { label: "LTV/CAC",      value: `${unitEconomics.ltvCacRatio}×`,               sub: "benchmark SaaS: > 3×",             color: "border-emerald-200 bg-emerald-50" },
              { label: "Payback",      value: `${unitEconomics.paybackMonths} meses`,         sub: "para recuperar CAC",               color: "border-violet-200 bg-violet-50" },
              { label: "ARPU",         value: formatCurrency(unitEconomics.arpu),             sub: "receita média por oficina/mês",    color: "border-amber-200 bg-amber-50"  },
              { label: "Churn mensal", value: `${unitEconomics.churnRate}%`,                  sub: "muito abaixo da média SaaS (5%)",  color: "border-slate-200 bg-slate-50"  },
            ].map((u) => (
              <div key={u.label} className={`rounded-xl border-2 p-5 ${u.color}`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{u.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mb-0.5">{u.value}</p>
                <p className="text-xs text-slate-500">{u.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ROADMAP */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Roadmap</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Q3 2024 → Q2 2025</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((q) => (
              <div
                key={q.quarter}
                className={`rounded-xl border-2 p-5 ${
                  q.status === "done"    ? "border-emerald-200 bg-emerald-50" :
                  q.status === "active"  ? "border-blue-300 bg-blue-50"      :
                  "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      q.status === "done"   ? "bg-emerald-600 text-white" :
                      q.status === "active" ? "bg-blue-600 text-white"   :
                      "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {q.status === "done" ? "✓ Concluído" : q.status === "active" ? "Em andamento" : "Planejado"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-3">{q.quarter}</p>
                <ul className="space-y-1.5">
                  {q.items.map((item) => (
                    <li key={item} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* TIME */}
        <section className="py-16 border-b">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Time</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Fundadores com experiência no setor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teamMembers.map((m) => (
              <div key={m.name} className="rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-lg flex items-center justify-center mb-3">
                  {m.name[0]}
                </div>
                <p className="font-bold text-slate-900">{m.name}</p>
                <p className="text-sm text-blue-600 font-medium">{m.role}</p>
                <p className="text-xs text-slate-500 mt-2">{m.bg}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAPTAÇÃO */}
        <section className="py-16 pb-24">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Captação</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">R$2,5M — Seed Round</h2>
          <p className="text-slate-500 max-w-xl mb-10 leading-relaxed">
            Buscamos R$2,5M para acelerar o crescimento para 500 oficinas ativas, lançar o app mobile
            e fechar o primeiro contrato de API direta com parceiro bancário.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {asks.map((a) => (
              <div key={a.label} className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
                <p className="text-2xl font-extrabold text-blue-900">{a.pct}%</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{a.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(a.value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-10 text-center">
            <h3 className="text-2xl font-bold mb-3">Vamos conversar?</h3>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              Estamos captando com term sheet aberto para os primeiros investidores.
              Deck completo + data room disponíveis sob NDA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:investidores@autocred.com.br"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors"
              >
                investidores@autocred.com.br <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-sm transition-colors">
                  Ver demo ao vivo
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t bg-slate-950 text-slate-400 py-8 px-6 text-center text-xs">
        <p className="mb-2">
          ⚠️ Este material é para fins informativos. AutoCred não realiza operações financeiras reais.
          Projeções são estimativas baseadas em premissas de mercado e não constituem garantia de retorno.
        </p>
        <p>© 2024 AutoCred Tecnologia Ltda. — São Paulo, SP — CNPJ 00.000.000/0001-00</p>
      </footer>
    </div>
  );
}

// Card helper inline
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
