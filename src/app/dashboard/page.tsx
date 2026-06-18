"use client";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CreditCard, CheckCircle, DollarSign, TrendingUp, Zap, Coins, Building2, BarChart2,
  Calculator, GitBranch, Users, Car, FileText, ClipboardList,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics, useQuotes, useServiceOrders } from "@/hooks/useStore";
import { platformMonthlyData, mockCreditFlow } from "@/data/mock";
import { formatCurrency, formatDate, financingStatusColor, financingStatusLabel, quoteStatusColor, quoteStatusLabel } from "@/lib/utils";

type KpiColor = "blue" | "green" | "violet" | "amber" | "slate" | "emerald" | "indigo" | "orange";
const colorMap: Record<KpiColor, string> = {
  blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600",
  violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600", emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600", orange: "bg-orange-50 text-orange-600",
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

export default function DashboardPage() {
  const metrics = useDashboardMetrics();
  const { quotes } = useQuotes();
  const { orders } = useServiceOrders();

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrders = [...orders]
    .filter((o) => !["finalizado", "entregue"].includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout title="Dashboard" subtitle="Visão geral da sua oficina">
      {/* KPI ROW 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Clientes cadastrados" value={String(metrics.totalCustomers)} sub="total na base" icon={Users} color="blue" />
        <Kpi title="Veículos" value={String(metrics.totalVehicles)} sub="cadastrados" icon={Car} color="violet" />
        <Kpi title="Orçamentos no mês" value={String(metrics.quotesThisMonth)} sub="mês atual" icon={FileText} color="amber" />
        <Kpi title="Ticket médio" value={metrics.avgTicket > 0 ? formatCurrency(metrics.avgTicket) : "—"} sub="orçamentos aprovados" icon={TrendingUp} color="green" />
      </div>
      {/* KPI ROW 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Kpi title="OS em aberto" value={String(metrics.openOrders)} sub="em execução" icon={ClipboardList} color="orange" />
        <Kpi title="OS concluídas" value={String(metrics.completedOrders)} sub="finalizadas/entregues" icon={CheckCircle} color="emerald" />
        <Kpi title="Receita gerada" value={metrics.revenueGenerated > 0 ? formatCurrency(metrics.revenueGenerated) : "—"} sub="OS concluídas" icon={DollarSign} color="indigo" />
        <Kpi title="Plano ativo" value="Pro" sub="R$249/mês" icon={Zap} color="slate" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume Financiado Mensal (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={platformMonthlyData}>
                <defs>
                  <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="volume" name="Volume" stroke="#2563eb" fill="url(#gVol)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financiamentos vs Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="financiamentos" name="Financiamentos" fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="aprovados" name="Aprovados" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* OS EM ABERTO + AÇÕES RÁPIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Orçamentos recentes</CardTitle>
            <Link href="/orcamentos"><Button variant="ghost" size="sm" className="text-blue-600 text-xs">Ver todos</Button></Link>
          </CardHeader>
          <CardContent>
            {recentQuotes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum orçamento ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Serviço</th>
                    <th className="py-2 pr-3">Valor</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Data</th>
                  </tr></thead>
                  <tbody>
                    {recentQuotes.map((q) => (
                      <tr key={q.id} className="border-b last:border-0">
                        <td className="py-2.5 pr-3 font-medium">{q.customerName}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{q.serviceType}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatCurrency(q.totalValue)}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${quoteStatusColor[q.status]}`}>
                            {quoteStatusLabel[q.status]}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-500 text-xs">{formatDate(q.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/orcamentos/novo" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><FileText className="w-4 h-4" /> Novo Orçamento</Button>
            </Link>
            <Link href="/clientes" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><Users className="w-4 h-4" /> Clientes</Button>
            </Link>
            <Link href="/ordens" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><ClipboardList className="w-4 h-4" /> Ordens de Serviço</Button>
            </Link>
            <Link href="/simulador" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><Calculator className="w-4 h-4" /> Simulador</Button>
            </Link>
            <Link href="/financiamento" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><CreditCard className="w-4 h-4" /> Solicitar Crédito</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* OS em aberto */}
      {recentOrders.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">OS em andamento</CardTitle>
            <Link href="/ordens"><Button variant="ghost" size="sm" className="text-blue-600 text-xs">Ver todas</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-semibold text-sm">{o.osNumber} — {o.serviceType}</p>
                    <p className="text-xs text-slate-500">{o.customerName} · {o.vehicleInfo}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      { recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700", em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700", finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700" }[o.status]
                    }`}>
                      {{ recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução", aguardando_peca: "Ag. peça", finalizado: "Finalizado", entregue: "Entregue" }[o.status]}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(o.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
