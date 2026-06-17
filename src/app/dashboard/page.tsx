"use client";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CreditCard, CheckCircle, DollarSign, TrendingUp, Zap, Coins, Building2, BarChart2,
  Calculator, GitBranch, ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockFinancingRequests, mockCreditFlow, platformMonthlyData } from "@/data/mock";
import {
  formatCurrency, formatDate, financingStatusColor, financingStatusLabel,
  riskLevelColor, riskLevelLabel,
} from "@/lib/utils";

type KpiColor = "blue" | "green" | "violet" | "amber" | "slate" | "emerald" | "indigo" | "orange";

const colorMap: Record<KpiColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  orange: "bg-orange-50 text-orange-600",
};

function Kpi({ title, value, sub, icon: Icon, color }: {
  title: string; value: string; sub: string; icon: typeof CreditCard; color: KpiColor;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function maskCpf(cpf: string) {
  return cpf.slice(0, 3) + ".***.***-**";
}

export default function DashboardPage() {
  const recent = mockFinancingRequests.slice(0, 5);

  return (
    <DashboardLayout title="Dashboard de Crédito" subtitle="Auto Expert Silva & Filhos — Plataforma AutoCred">
      {/* KPI ROW 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Solicitações de crédito" value="10" sub="+3 esta semana" icon={CreditCard} color="blue" />
        <Kpi title="Taxa de aprovação" value="67.2%" sub="acima da média" icon={CheckCircle} color="green" />
        <Kpi title="Volume financiado" value="R$412.8K" sub="total histórico" icon={DollarSign} color="violet" />
        <Kpi title="Ticket médio" value="R$2.640" sub="por reparo financiado" icon={TrendingUp} color="amber" />
      </div>
      {/* KPI ROW 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Kpi title="Receita SaaS" value="R$249/mês" sub="Plano Pro ativo" icon={Zap} color="slate" />
        <Kpi title="Comissão acumulada" value="R$14.448" sub="4% sobre financiados" icon={Coins} color="emerald" />
        <Kpi title="Oficinas na rede" value="134" sub="plataforma AutoCred" icon={Building2} color="indigo" />
        <Kpi title="Conversão" value="38.4%" sub="lead → crédito" icon={BarChart2} color="orange" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume Financiado Mensal (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={platformMonthlyData}>
                <defs>
                  <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="volume" name="Volume" stroke="#2563eb" fill="url(#gVol)" strokeWidth={2} />
                <Area type="monotone" dataKey="comissao" name="Comissão" stroke="#10b981" fill="url(#gCom)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financiamentos vs Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platformMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="financiamentos" name="Financiamentos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aprovados" name="Aprovados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CREDIT FLOW MINI */}
      <Card className="mt-6">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Fluxo ativo: João Pedro Oliveira — Toyota Corolla 2019 — R$ 2.890
          </CardTitle>
          <Link href="/fluxo" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Ver detalhes <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {mockCreditFlow.steps.map((step) => {
              const isDone = step.status === "done";
              const isActive = step.status === "active";
              return (
                <div key={step.id} className="flex flex-col items-center text-center min-w-[90px] flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-600 text-white step-active"
                          : "bg-slate-100 text-slate-400 border border-slate-300"
                    }`}
                  >
                    {step.id}
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-2 leading-tight">{step.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.time}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* RECENT REQUESTS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Solicitações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">CPF</th>
                    <th className="py-2 pr-3">Serviço</th>
                    <th className="py-2 pr-3">Valor</th>
                    <th className="py-2 pr-3">Parcelas</th>
                    <th className="py-2 pr-3">Parceiro</th>
                    <th className="py-2 pr-3">Risco</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-slate-800">{f.customerName}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{maskCpf(f.cpf)}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{f.serviceType}</td>
                      <td className="py-2.5 pr-3 font-semibold">{formatCurrency(f.requestedAmount)}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{f.installments}x</td>
                      <td className="py-2.5 pr-3 text-slate-600">{f.partnerName}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${riskLevelColor[f.riskLevel]}`}>
                          {riskLevelLabel[f.riskLevel]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${financingStatusColor[f.status]}`}>
                          {financingStatusLabel[f.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">{formatDate(f.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/financiamento" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><CreditCard className="w-4 h-4" /> Nova Solicitação</Button>
            </Link>
            <Link href="/simulador" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><Calculator className="w-4 h-4" /> Simulador</Button>
            </Link>
            <Link href="/parceiros" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><Building2 className="w-4 h-4" /> Parceiros</Button>
            </Link>
            <Link href="/pipeline" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><GitBranch className="w-4 h-4" /> Pipeline</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
