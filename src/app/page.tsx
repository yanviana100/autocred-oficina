"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import {
  ClipboardList, DollarSign, BarChart2, Car, FileText, Users,
  CheckCircle, ArrowRight, Menu, X, Wrench, Clock, TrendingUp,
  Shield, Zap, ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Planos", href: "#planos" },
  { label: "Depoimentos", href: "#depoimentos" },
];

const PROBLEMS = [
  { icon: ClipboardList, title: "OS perdida em papel", desc: "Ordem de serviço anotada no caderno some, cliente liga cobrando e você não sabe onde está o carro." },
  { icon: DollarSign, title: "Dinheiro que some", desc: "Serviço feito, peça comprada, mas no fim do mês não sabe quanto entrou, quanto saiu e quanto ainda vai receber." },
  { icon: Clock, title: "Tempo jogado fora", desc: "Horas perdidas buscando histórico de cliente, refazendo orçamento, ligando para saber se pagou ou não pagou." },
];

const FEATURES = [
  { icon: ClipboardList, title: "Ordens de Serviço", desc: "Crie, acompanhe e finalize OS em segundos. KM de entrada e saída, técnico responsável, status em tempo real." },
  { icon: FileText, title: "Orçamentos Profissionais", desc: "Gere orçamentos com logo da sua oficina em PDF. Cliente aprova, vira OS automaticamente." },
  { icon: DollarSign, title: "Controle de Pagamento", desc: "Dinheiro, Pix, cartão, boleto — registre tudo. Veja o que foi pago e o que está em aberto." },
  { icon: Car, title: "Histórico do Veículo", desc: "Todo serviço feito no carro registrado. Quando o cliente voltar, você já sabe tudo que aconteceu antes." },
  { icon: BarChart2, title: "Relatórios", desc: "Faturamento, ticket médio, serviços mais realizados, melhores clientes. Tudo em um painel." },
  { icon: Users, title: "Gestão de Clientes", desc: "Cadastro completo com múltiplos veículos por cliente. Nunca perde um dado, nunca cria duplicata." },
];

const STEPS = [
  { n: "01", title: "Agende uma demo", desc: "Você fala com a gente pelo WhatsApp. Mostramos o sistema ao vivo em 20 minutos." },
  { n: "02", title: "Configuramos para você", desc: "Em menos de 1 hora sua oficina já está no sistema com os primeiros dados cadastrados." },
  { n: "03", title: "Comece a usar", desc: "Crie sua primeira OS no mesmo dia. Sua equipe aprende em minutos — sem treinamento longo." },
];

const TESTIMONIALS = [
  { name: "Carlos M.", role: "Dono · Auto Center Silva", text: "Antes eu não sabia quanto dinheiro minha oficina ganhava no mês. Hoje abro o relatório e vejo tudo na hora." },
  { name: "Roberto A.", role: "Gerente · Oficina Rápida", text: "O cliente chegou reclamando de um problema que a gente já tinha resolvido há 3 meses. Abri o histórico e mostrei na hora. Nunca mais tive esse problema." },
  { name: "Marcos P.", role: "Proprietário · MecaFix", text: "Minha equipe adotou em dois dias. O orçamento em PDF impressionou os clientes — parece empresa grande." },
];

const CHECKLIST = [
  "Ordens de serviço ilimitadas",
  "Orçamentos em PDF profissional",
  "Controle de pagamento completo",
  "Histórico de veículos",
  "Relatórios financeiros",
  "Gestão de clientes e veículos",
  "Cadastro de técnicos",
  "Suporte via WhatsApp",
];

function Calculator({ waUrl }: { waUrl: string }) {
  const [os, setOs] = useState(30);
  const [ticket, setTicket] = useState(350);
  const [perda, setPerda] = useState(15);

  const perdaMensal = Math.round((os * perda) / 100 * ticket);
  const perdaAnual = perdaMensal * 12;
  const custoSistema = 197;
  const roi = perdaMensal - custoSistema;

  return (
    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">OS por mês</label>
            <span className="text-sm font-bold text-blue-600">{os}</span>
          </div>
          <input type="range" min={5} max={200} step={5} value={os} onChange={(e) => setOs(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5</span><span>200</span></div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Ticket médio da OS</label>
            <span className="text-sm font-bold text-blue-600">R${ticket}</span>
          </div>
          <input type="range" min={100} max={2000} step={50} value={ticket} onChange={(e) => setTicket(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>R$100</span><span>R$2.000</span></div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">OS perdidas por desorganização</label>
            <span className="text-sm font-bold text-red-500">{perda}%</span>
          </div>
          <input type="range" min={5} max={40} step={5} value={perda} onChange={(e) => setPerda(Number(e.target.value))}
            className="w-full accent-red-500" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5%</span><span>40%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Perda mensal estimada</p>
          <p className="text-3xl font-black text-red-600">R${perdaMensal.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Perda anual estimada</p>
          <p className="text-3xl font-black text-red-600">R${perdaAnual.toLocaleString("pt-BR")}</p>
        </div>
        <div className={`rounded-2xl p-5 text-center border ${roi > 0 ? "bg-emerald-50 border-emerald-100" : "bg-slate-100 border-slate-200"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${roi > 0 ? "text-emerald-600" : "text-slate-500"}`}>ROI com OficinaPro</p>
          <p className={`text-3xl font-black ${roi > 0 ? "text-emerald-600" : "text-slate-400"}`}>
            {roi > 0 ? `+R$${roi.toLocaleString("pt-BR")}/mês` : "—"}
          </p>
        </div>
      </div>

      {roi > 0 && (
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">
            O sistema custa <strong>R$197/mês</strong> e pode recuperar <strong>R${perdaMensal.toLocaleString("pt-BR")}/mês</strong> em receita perdida.
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 text-sm">
            Quero recuperar essa receita <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const WHATSAPP = "5511999999999"; // substituir pelo número real
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero agendar uma demo do OficinaPro.")}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">OficinaPro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900">Entrar</Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Agendar demo
            </a>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="block text-sm text-slate-600 py-1" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-2">
              Agendar demo gratuita
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Sistema completo para oficinas mecânicas</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Sua oficina organizada.<br />
            <span className="text-blue-400">Seu dinheiro no controle.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            OficinaPro é o sistema de gestão para oficinas mecânicas que funciona de verdade. OS, orçamentos, pagamentos e relatórios — tudo em um lugar só.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
            >
              Agendar demo gratuita <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors border border-white/10"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-5">Demo gratuita · Sem cartão de crédito · Configuração em 1 hora</p>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4">
          {[
            { value: "20+", label: "oficinas ativas" },
            { value: "100%", label: "satisfação dos clientes" },
            { value: "< 1h", label: "para começar a usar" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Sua oficina está perdendo dinheiro todo dia
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Não por falta de serviço — por falta de controle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tudo que sua oficina precisa
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Em um sistema simples, rápido e feito para mecânicos — não para contadores.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Começa a usar hoje mesmo
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Sem instalação, sem treinamento longo, sem complicação.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="text-5xl font-black text-blue-600/20 mb-3">{s.n}</div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-5 h-5 text-slate-700" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              Quero agendar minha demo <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Quanto sua oficina está perdendo por mês?
            </h2>
            <p className="text-slate-500 text-lg">Ajuste os números abaixo e veja o impacto real.</p>
          </div>
          <Calculator waUrl={waUrl} />
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
              <span className="text-blue-600 text-sm font-medium">Primeiros 50 clientes — preço de fundador</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Planos simples, sem surpresa</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Sem fidelidade. Cancele quando quiser. Garantia de 30 dias.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Starter</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">R$197</span>
                <span className="text-slate-400 mb-1">/mês</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">1 usuário · até 100 clientes</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Ordens de serviço ilimitadas", "Orçamentos em PDF", "Controle de pagamentos", "Histórico de veículos", "Gestão de clientes"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block text-center bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Começar grátis 14 dias
              </a>
            </div>

            {/* Pro — destaque */}
            <div className="bg-blue-600 rounded-2xl p-7 flex flex-col relative shadow-xl shadow-blue-600/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">MAIS POPULAR</div>
              <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">R$347</span>
                <span className="text-blue-200 mb-1">/mês</span>
              </div>
              <p className="text-xs text-blue-200 mb-6">3 usuários · clientes ilimitados</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Tudo do Starter", "WhatsApp automático para clientes", "Relatórios avançados", "Clientes inativos com 1 clique", "Suporte prioritário"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="w-4 h-4 text-blue-200 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block text-center bg-white hover:bg-blue-50 text-blue-600 font-bold py-3 rounded-xl transition-colors text-sm">
                Começar grátis 14 dias
              </a>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Premium</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">R$597</span>
                <span className="text-slate-400 mb-1">/mês</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Usuários ilimitados</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Tudo do Pro", "Emissão de NFS-e", "Controle de estoque de peças", "API para integrações", "Gerente de conta dedicado"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block text-center bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Começar grátis 14 dias
              </a>
            </div>
          </div>

          {/* Garantia */}
          <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 14 dias grátis, sem cartão</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Cancele quando quiser</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Garantia de 30 dias ou devolvemos</span>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Oficinas que já transformaram a gestão
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-sm font-medium">Demo gratuita · Sem compromisso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sua oficina organizada em menos de 1 hora
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Agende agora uma demo de 20 minutos e veja como o OficinaPro funciona na prática — com os dados da sua oficina.
          </p>

          <div className="bg-white/10 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-left">
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">O que está incluso:</p>
            <div className="space-y-2">
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-200 flex-shrink-0" />
                  <span className="text-white text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-xl"
          >
            Agendar demo gratuita <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-blue-200 text-sm mt-4">Respondemos em menos de 2 horas</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">OficinaPro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 OficinaPro. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacidade</Link>
            <Link href="/auth/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
