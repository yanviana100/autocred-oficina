"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2, TrendingUp, DollarSign, CheckCircle, Star, Zap,
  MapPin, Phone, Mail, CreditCard, Edit, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockWorkshop, mockFinancingRequests, platformMonthlyData } from "@/data/mock";
import { formatCurrency, planPrice } from "@/lib/utils";

const planLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  premium: "Premium",
};

const planColors: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700",
  pro: "bg-blue-100 text-blue-700",
  premium: "bg-amber-100 text-amber-700",
};

const commissionHistory = mockFinancingRequests
  .filter((r) => r.status === "convertido" || r.status === "pre_aprovado")
  .map((r) => ({
    id: r.id,
    customer: r.customerName,
    service: r.serviceType,
    amount: r.requestedAmount,
    shopComm: r.shopCommission ?? r.requestedAmount * 0.04,
    autocredComm: r.autocredCommission ?? r.requestedAmount * 0.025,
    partner: r.partnerName ?? "—",
    date: r.createdAt,
  }));

const monthlyComm = platformMonthlyData.map((d) => ({
  mes: d.mes,
  comissao: Math.round(d.comissao * 0.04 * 1.8),
}));

export default function PerfilPage() {
  const plan = mockWorkshop.plan;

  return (
    <DashboardLayout
      title="Minha Oficina"
      subtitle="Perfil, desempenho e histórico de comissões"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna esquerda — info + plano */}
        <div className="space-y-4">
          {/* Card identidade */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">{mockWorkshop.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{mockWorkshop.cnpj}</p>
                  <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${planColors[plan]}`}>
                    Plano {planLabels[plan]}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { icon: Building2, label: "Responsável", value: mockWorkshop.owner },
                  { icon: MapPin, label: "Cidade", value: `${mockWorkshop.city} — ${mockWorkshop.state}` },
                  { icon: Phone, label: "WhatsApp", value: mockWorkshop.whatsapp },
                  { icon: Mail, label: "E-mail", value: mockWorkshop.email },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 flex-shrink-0">{label}:</span>
                    <span className="text-slate-700 truncate">{value}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                <Edit className="w-3.5 h-3.5" /> Editar dados
              </Button>
            </CardContent>
          </Card>

          {/* Card plano */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-blue-900">Plano {planLabels[plan]}</p>
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {formatCurrency(planPrice[plan])}<span className="text-sm font-normal text-blue-600">/mês</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-blue-800">
                {[
                  "Solicitações de crédito ilimitadas",
                  "Pipeline Kanban completo",
                  "Simulador com comissão",
                  "Relatórios mensais",
                  "Suporte WhatsApp prioritário",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/investidor">
                <Button size="sm" className="w-full mt-4 gap-1 bg-blue-700 hover:bg-blue-800">
                  Upgrade para Premium <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita — KPIs + gráfico + tabela */}
        <div className="xl:col-span-2 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Volume financiado",
                value: formatCurrency(mockWorkshop.totalFinanced ?? 0),
                sub: "total histórico",
                icon: DollarSign,
                color: "bg-violet-50 text-violet-600",
              },
              {
                label: "Comissão acumulada",
                value: formatCurrency(mockWorkshop.totalCommission ?? 0),
                sub: "4% dos aprovados",
                icon: TrendingUp,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Taxa de aprovação",
                value: `${mockWorkshop.approvalRate ?? 0}%`,
                sub: "média plataforma: 67%",
                icon: CheckCircle,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Ticket médio",
                value: formatCurrency(mockWorkshop.avgTicket ?? 0),
                sub: "por financiamento",
                icon: CreditCard,
                color: "bg-amber-50 text-amber-600",
              },
              {
                label: "Volume mensal",
                value: formatCurrency(mockWorkshop.monthlyVolume ?? 0),
                sub: "último mês",
                icon: Star,
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                label: "Pedidos ativos",
                value: String(mockWorkshop.activeRequests ?? 0),
                sub: "em andamento",
                icon: Building2,
                color: "bg-orange-50 text-orange-600",
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-500 leading-tight">{kpi.label}</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico comissão mensal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Comissão mensal (R$)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyComm}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" fontSize={12} stroke="#94a3b8" />
                  <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), "Comissão"]} />
                  <Bar dataKey="comissao" name="Comissão" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de comissões */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico de comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionHistory.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhuma comissão convertida ainda. <Link href="/financiamento" className="text-blue-600 hover:underline">Iniciar solicitação</Link>
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Cliente</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Serviço</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Valor</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Comissão (4%)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Parceiro</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {commissionHistory.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-medium text-slate-800">{row.customer}</td>
                          <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate">{row.service}</td>
                          <td className="px-3 py-2.5 font-semibold">{formatCurrency(row.amount)}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-emerald-700">{formatCurrency(row.shopComm)}</span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 text-xs">{row.partner}</td>
                          <td className="px-3 py-2.5 text-slate-400 text-xs">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-emerald-50">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-slate-700">Total</td>
                        <td className="px-3 py-2 text-sm font-bold text-emerald-700">
                          {formatCurrency(commissionHistory.reduce((s, r) => s + r.shopComm, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
