"use client";
import Link from "next/link";
import {
  CreditCard, AlertTriangle, TrendingDown, Clock, TrendingUp, DollarSign,
  Shield, Zap, Users, BarChart2, CheckCircle, ArrowRight, Quote as QuoteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const heroStats = [
  { label: "oficinas ativas", value: "134" },
  { label: "financiados", value: "R$ 4,2M" },
  { label: "taxa de aprovação", value: "67%" },
  { label: "tempo médio", value: "< 2h" },
];

const problems = [
  { icon: AlertTriangle, num: "38%", desc: "dos clientes abandonam o reparo por não conseguir pagar à vista" },
  { icon: TrendingDown, num: "R$ 33 bilhões", desc: "em reparos são perdidos anualmente no Brasil por falta de crédito" },
  { icon: Clock, num: "550 mil", desc: "oficinas mecânicas sem acesso a uma solução de financiamento integrada" },
];

const steps = [
  { n: 1, title: "Crie o orçamento", desc: "Oficina lança o orçamento no AutoCred com peças e mão de obra" },
  { n: 2, title: "Cliente solicita crédito", desc: "Cliente preenche pré-análise em 2 minutos direto no link do orçamento" },
  { n: 3, title: "Aprovação e pagamento", desc: "Parceiro financeiro aprova. Oficina recebe integral. Cliente paga parcelado." },
];

const benefits = [
  { icon: TrendingUp, title: "Aumento de 40% no ticket médio", desc: "Clientes aprovam reparos maiores quando podem parcelar" },
  { icon: DollarSign, title: "Comissão de 4% sobre cada financiamento", desc: "Renda extra além do valor do serviço" },
  { icon: Shield, title: "Zero risco de inadimplência", desc: "O risco fica 100% com o parceiro financeiro" },
  { icon: Zap, title: "Aprovação em menos de 2 horas", desc: "Não perca o cliente por demora no processo" },
  { icon: Users, title: "Fidelização do cliente", desc: "Clientes financiados têm 3x mais chance de retornar" },
  { icon: BarChart2, title: "Dashboard completo", desc: "Acompanhe volume, comissões e aprovações em tempo real" },
];

const plans = [
  {
    name: "Starter", price: "R$150", highlight: false,
    features: ["30 orçamentos/mês", "1 usuário", "Simulador básico", "Relatórios básicos", "Suporte por email"],
  },
  {
    name: "Pro", price: "R$250", highlight: true,
    features: ["Orçamentos ilimitados", "3 usuários", "Pipeline completo", "Link público", "Relatórios avançados", "Suporte prioritário"],
  },
  {
    name: "Premium", price: "R$399", highlight: false,
    features: ["Tudo do Pro", "Usuários ilimitados", "Relatórios completos", "NF-e integrado", "Gerente dedicado"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)" }} className="text-white">
        <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">AutoCred</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-200">
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#precos" className="hover:text-white">Preços</a>
            <a href="#parceiros" className="hover:text-white">Para parceiros</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button className="bg-blue-600 hover:bg-blue-500">Começar grátis</Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Transforme reparos perdidos em receita garantida
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
            A plataforma de crédito automotivo que conecta oficinas mecânicas a financiadores parceiros.
            Seu cliente aprova o crédito em minutos. Você recebe o pagamento integral.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/cadastro">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 gap-2 w-full sm:w-auto">
                Começar gratuitamente <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent w-full sm:w-auto">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-blue-300">{s.value}</p>
                <p className="text-sm text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">O problema que custa bilhões às oficinas</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {problems.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.num} className="rounded-2xl border border-slate-200 p-8 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{p.num}</p>
                  <p className="text-slate-600 mt-2">{p.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 max-w-3xl mx-auto bg-slate-50 border-l-4 border-blue-600 rounded-r-xl p-8">
            <QuoteIcon className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-lg text-slate-700 italic">
              &ldquo;Perco de 3 a 5 clientes por semana porque eles não têm como pagar. Com AutoCred, aprovei 8 financiamentos no primeiro mês.&rdquo;
            </p>
            <p className="mt-4 font-semibold text-slate-900">— Carlos Silva, Auto Expert Silva &amp; Filhos, São Paulo/SP</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto">
                  {s.n}
                </div>
                <h3 className="text-xl font-semibold mt-5">{s.title}</h3>
                <p className="text-slate-600 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-lg font-medium text-blue-700">
            Você não assume risco de crédito. O risco fica com o parceiro financeiro.
          </p>
        </div>
      </section>

      {/* BENEFITS FOR SHOPS */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Para oficinas: venda mais, perca menos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-2xl border border-slate-200 p-6 card-hover">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-slate-600 mt-1.5">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MARKET OPPORTUNITY */}
      <section className="py-20" style={{ background: "#172554" }}>
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Uma oportunidade de R$ 87 bilhões</h2>
          <div className="mt-12">
            <div className="rounded-2xl p-8" style={{ background: "#1e3a8a" }}>
              <p className="text-2xl font-bold">TAM — R$ 87B</p>
              <p className="text-slate-300">Mercado total de reparos automotivos</p>
              <div className="rounded-2xl p-8 mt-4" style={{ background: "#2563eb" }}>
                <p className="text-2xl font-bold">SAM — R$ 8,7B</p>
                <p className="text-blue-100">50 mil oficinas com ticket acima de R$1.500</p>
                <div className="rounded-2xl p-8 mt-4" style={{ background: "#3b82f6" }}>
                  <p className="text-2xl font-bold">SOM — R$ 87M</p>
                  <p className="text-blue-50">Meta conservadora: 1% em 3 anos</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-10 text-slate-200 max-w-2xl mx-auto">
            Com apenas 1% de penetração no SAM, AutoCred projeta R$87M em volume financiado — gerando R$5.7M em comissões anuais.
          </p>
        </div>
      </section>

      {/* BENEFITS FOR PARTNERS */}
      <section id="parceiros" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Para parceiros financeiros: demanda qualificada, zero CAC
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { title: "Novo canal de distribuição", desc: "Acesse milhares de oficinas e clientes prontos para financiar reparos." },
              { title: "Clientes pré-triados", desc: "Cada solicitação chega com pré-análise de risco e dados validados." },
              { title: "Integração 100% digital", desc: "API e fluxo automatizado. Decisão em horas, sem papelada." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 p-8 card-hover">
                <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-slate-600 mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto text-center">
            <div><p className="text-2xl font-bold text-blue-600">4 parceiros</p><p className="text-sm text-slate-500">ativos</p></div>
            <div><p className="text-2xl font-bold text-blue-600">R$21,6M</p><p className="text-sm text-slate-500">capacidade mensal</p></div>
            <div><p className="text-2xl font-bold text-blue-600">R$4,2M</p><p className="text-sm text-slate-500">já originados</p></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Planos e preços</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12 items-start">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 bg-white border ${p.highlight ? "border-blue-600 shadow-xl ring-2 ring-blue-600 md:-translate-y-2" : "border-slate-200"}`}
              >
                {p.highlight && (
                  <span className="inline-block text-xs font-semibold bg-blue-600 text-white rounded-full px-3 py-1 mb-3">Mais popular</span>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-3xl font-bold mt-2">{p.price}<span className="text-base font-normal text-slate-500">/mês</span></p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/cadastro">
                  <Button className={`w-full mt-8 ${p.highlight ? "bg-blue-600 hover:bg-blue-500" : ""}`} variant={p.highlight ? "default" : "outline"}>
                    Começar
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Comece hoje. As próximas vendas que você perder custam mais que o plano.
          </h2>
          <Link href="/auth/cadastro">
            <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-500 gap-2">
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white">
              <CreditCard className="w-5 h-5" /> <span className="font-bold">AutoCred</span>
            </div>
            <p className="mt-2 text-sm">© 2024 AutoCred. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="space-y-2">
              <p className="text-white font-semibold">Produto</p>
              <a href="#como-funciona" className="block hover:text-white">Como funciona</a>
              <a href="#precos" className="block hover:text-white">Preços</a>
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold">Empresa</p>
              <Link href="/investidor" className="block hover:text-white">Para investidores</Link>
              <Link href="/auth/login" className="block hover:text-white">Entrar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
