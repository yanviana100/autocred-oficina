"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, FileText, DollarSign, Users, TrendingUp, BarChart2,
  Shield, CheckCircle, Zap,
} from "lucide-react";
import { mockAdminMetrics, mockAllWorkshops, platformMonthlyData } from "@/data/mock";
import { formatCurrency, formatDate, planLabel, planColor, formatCurrencyShort } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const planPrices = { starter: 99, pro: 249, premium: 499 };

const planData = [
  { name: "Starter",  value: mockAdminMetrics.workshopsByPlan.starter,  color: "#94a3b8" },
  { name: "Pro",      value: mockAdminMetrics.workshopsByPlan.pro,       color: "#3b82f6" },
  { name: "Premium",  value: mockAdminMetrics.workshopsByPlan.premium,   color: "#8b5cf6" },
];

const revenueBreakdown = [
  { nome: "SaaS Starter",  valor: mockAdminMetrics.workshopsByPlan.starter  * planPrices.starter,  cor: "#94a3b8" },
  { nome: "SaaS Pro",      valor: mockAdminMetrics.workshopsByPlan.pro      * planPrices.pro,       cor: "#3b82f6" },
  { nome: "SaaS Premium",  valor: mockAdminMetrics.workshopsByPlan.premium  * planPrices.premium,   cor: "#8b5cf6" },
  { nome: "Comissão 2.5%", valor: mockAdminMetrics.commissionRevenue,                              cor: "#10b981" },
];

const projectionData = [
  { ano: "2024", mrr: 28450,  comissao: 64312  },
  { ano: "2025", mrr: 94500,  comissao: 245000 },
  { ano: "2026", mrr: 249000, comissao: 820000 },
  { ano: "2027", mrr: 598000, comissao: 2450000},
];

const calculatedMRR =
  mockAdminMetrics.workshopsByPlan.starter * planPrices.starter +
  mockAdminMetrics.workshopsByPlan.pro     * planPrices.pro     +
  mockAdminMetrics.workshopsByPlan.premium * planPrices.premium;

type Tab = "operacional" | "financeiro" | "oficinas";

const ADMIN_EMAILS = ["vianayan99@gmail.com"];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("operacional");

  useEffect(() => {}, []); // keep hook order stable

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return (
      <DashboardLayout title="Admin" subtitle="">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Shield className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">Acesso restrito</p>
          <p className="text-sm text-slate-400 mt-1">Esta área é exclusiva para administradores AutoCred.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Painel Administrativo" subtitle="Visão geral da plataforma AutoCred">
      {/* Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl text-white flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-300 flex-shrink-0" />
        <div>
          <p className="font-bold">Área Administrativa — Acesso Restrito</p>
          <p className="text-sm text-blue-200">Dados da plataforma em tempo real (mockado para demonstração)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {([
          { key: "operacional", label: "Operacional" },
          { key: "financeiro",  label: "Financeiro"  },
          { key: "oficinas",    label: "Oficinas"    },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════ OPERACIONAL ══════════════════════════════ */}
      {tab === "operacional" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {[
              { label: "Oficinas ativas",    value: String(mockAdminMetrics.totalWorkshops),                   icon: Building2, color: "bg-blue-500" },
              { label: "Orçamentos",         value: String(mockAdminMetrics.totalQuotes),                      icon: FileText,  color: "bg-violet-500" },
              { label: "Volume financiado",  value: formatCurrencyShort(mockAdminMetrics.totalFinancingRequested), icon: DollarSign,color: "bg-amber-500" },
              { label: "Leads financeiros",  value: String(mockAdminMetrics.totalLeads),                      icon: Users,     color: "bg-orange-500" },
              { label: "Taxa aprovação",     value: `${mockAdminMetrics.conversionRate}%`,                    icon: TrendingUp,color: "bg-green-500" },
              { label: "MRR",               value: formatCurrency(calculatedMRR),                             icon: BarChart2, color: "bg-emerald-500" },
            ].map((m) => (
              <Card key={m.label} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1 leading-tight">{m.label}</p>
                      <p className="text-lg font-bold text-slate-900">{m.value}</p>
                    </div>
                    <div className={`${m.color} rounded-lg p-2`}>
                      <m.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Crescimento oficinas + financiamentos */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Crescimento da plataforma (Jan–Jun 2024)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={platformMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="oficinas"       name="Oficinas"        fill="#3b82f6" radius={[3,3,0,0]} />
                    <Bar dataKey="financiamentos" name="Financiamentos"  fill="#f59e0b" radius={[3,3,0,0]} />
                    <Bar dataKey="aprovados"      name="Aprovados"       fill="#10b981" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pizza planos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Distribuição por plano</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} oficinas`, ""]} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════ FINANCEIRO ═══════════════════════════════ */}
      {tab === "financeiro" && (
        <>
          {/* KPIs financeiros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "MRR SaaS",          value: formatCurrency(calculatedMRR),                       color: "text-blue-700" },
              { label: "Comissão mensal",    value: formatCurrency(mockAdminMetrics.commissionRevenue),  color: "text-emerald-700" },
              { label: "Receita total/mês",  value: formatCurrency(calculatedMRR + mockAdminMetrics.commissionRevenue), color: "text-slate-900" },
              { label: "Vol. financiado",    value: formatCurrencyShort(mockAdminMetrics.totalFinancingRequested), color: "text-violet-700" },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                  <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Breakdown receita — pizza */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Composição da receita mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="valor" nameKey="nome" paddingAngle={3}>
                      {revenueBreakdown.map((e, i) => <Cell key={i} fill={e.cor} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Projeção volume financiado */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Volume financiado mensal (R$)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={platformMonthlyData}>
                    <defs>
                      <linearGradient id="gVol3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" fontSize={12} stroke="#94a3b8" />
                    <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="volume" name="Volume" stroke="#2563eb" fill="url(#gVol3)" strokeWidth={2} />
                    <Area type="monotone" dataKey="comissao" name="Comissão" stroke="#10b981" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de projeção */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Projeção de crescimento — 2024→2027
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Ano", "Oficinas", "MRR SaaS", "Comissão/mês", "Receita total/mês"].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projectionData.map((r) => (
                      <tr key={r.ano} className={r.ano === "2024" ? "bg-blue-50 font-semibold" : "hover:bg-slate-50"}>
                        <td className="px-4 py-3 font-bold">{r.ano}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.ano === "2024" ? "134" : r.ano === "2025" ? "500" : r.ano === "2026" ? "1.500" : "4.000"}
                        </td>
                        <td className="px-4 py-3 text-blue-700">{formatCurrency(r.mrr)}</td>
                        <td className="px-4 py-3 text-emerald-700">{formatCurrency(r.comissao)}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(r.mrr + r.comissao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ═══════════════════════════════════ OFICINAS ══════════════════════════════════ */}
      {tab === "oficinas" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Oficinas cadastradas ({mockAllWorkshops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {["Oficina", "Responsável", "Cidade", "Plano", "Vol. financiado", "Comissão", "Taxa aprox.", "Desde", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockAllWorkshops.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium max-w-[180px] truncate">{w.name}</td>
                      <td className="px-4 py-3 text-slate-600">{w.owner}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{w.city}, {w.state}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColor[w.plan]}`}>
                          {planLabel[w.plan]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-violet-700 whitespace-nowrap">
                        {w.totalFinanced ? formatCurrencyShort(w.totalFinanced) : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">
                        {w.totalCommission ? formatCurrency(w.totalCommission) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {w.approvalRate ? `${w.approvalRate}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(w.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
