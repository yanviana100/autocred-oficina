"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Clock, AlertCircle, ArrowRight, Zap, TrendingUp,
  User, Car, DollarSign, Building2, Radio,
} from "lucide-react";
import { mockCreditFlow, mockFinancingRequests } from "@/data/mock";
import { formatCurrency, financingStatusLabel, financingStatusColor } from "@/lib/utils";

const stepIcons = [User, Car, DollarSign, AlertCircle, CheckCircle, Zap, Building2];

function StepCircle({ step }: { step: typeof mockCreditFlow.steps[number] }) {
  const isDone = step.status === "done";
  const isActive = step.status === "active";
  const Icon = stepIcons[step.id - 1] ?? CheckCircle;

  if (isDone) {
    return (
      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md flex-shrink-0">
        <CheckCircle className="w-6 h-6 text-white" />
      </div>
    );
  }
  if (isActive) {
    return (
      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg flex-shrink-0 step-active">
        <Icon className="w-6 h-6 text-white" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-slate-400">{step.id}</span>
    </div>
  );
}

export default function FluxoPage() {
  const activeRequests = mockFinancingRequests.filter(
    (r) => ["novo", "em_analise", "documentos_pendentes"].includes(r.status)
  ).slice(0, 3);

  return (
    <DashboardLayout
      title="Fluxo de Crédito"
      subtitle="Acompanhe cada etapa do processo de aprovação em tempo real"
    >
      {/* Demo banner */}
      <div className="mb-6 flex items-center gap-3 bg-blue-950 text-white rounded-xl px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Demo ao vivo</span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span><span className="text-slate-300">Cliente:</span> <strong>{mockCreditFlow.customerName}</strong></span>
          <span><span className="text-slate-300">Veículo:</span> <strong>{mockCreditFlow.vehicleInfo}</strong></span>
          <span><span className="text-slate-300">Serviço:</span> <strong>{mockCreditFlow.serviceType}</strong></span>
          <span><span className="text-slate-300">Valor:</span> <strong className="text-emerald-400">{formatCurrency(mockCreditFlow.amount)}</strong></span>
          <span><span className="text-slate-300">Parceiro:</span> <strong>Santander Financiamentos</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stepper principal */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Etapas do processo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />

                <div className="space-y-0">
                  {mockCreditFlow.steps.map((step, idx) => {
                    const isDone = step.status === "done";
                    const isActive = step.status === "active";
                    const isPending = step.status === "pending";

                    return (
                      <div key={step.id} className="relative flex gap-5">
                        {/* Conector acima */}
                        {idx > 0 && (
                          <div
                            className="absolute left-6 -top-4 w-0.5 h-4"
                            style={{
                              background: mockCreditFlow.steps[idx - 1].status === "done"
                                ? "#10b981"
                                : "#e2e8f0",
                            }}
                          />
                        )}

                        <div className="relative z-10 pb-8">
                          <StepCircle step={step} />
                        </div>

                        <div className="flex-1 pb-8 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`font-semibold text-sm ${
                                    isDone ? "text-emerald-700" :
                                    isActive ? "text-blue-700" :
                                    "text-slate-400"
                                  }`}
                                >
                                  {step.label}
                                </h3>
                                {isDone && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                    Concluído
                                  </span>
                                )}
                                {isActive && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium animate-pulse">
                                    Em andamento
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 leading-relaxed ${isPending ? "text-slate-300" : "text-slate-500"}`}>
                                {step.description}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-mono flex-shrink-0 ${
                                isPending ? "text-slate-300" : "text-slate-400"
                              }`}
                            >
                              {step.time !== "—" ? step.time : "pendente"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar direita */}
        <div className="space-y-4">
          {/* Live stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estatísticas do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Tempo até aprovação", value: "1h 48min", color: "text-blue-600" },
                { label: "Decisão do parceiro", value: "44 minutos", color: "text-emerald-600" },
                { label: "Parcela aprovada", value: "12× de R$ 291,10", color: "text-slate-900" },
                { label: "Valor financiado", value: formatCurrency(mockCreditFlow.amount), color: "text-slate-900" },
                { label: "Parceiro aprovador", value: "Santander Financiamentos", color: "text-slate-700" },
                { label: "Risco classificado", value: "Baixo risco", color: "text-emerald-600" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comissão gerada */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
                Receita gerada nesta operação
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Comissão oficina (4%)</span>
                  <span className="font-bold text-emerald-800">
                    {formatCurrency(mockCreditFlow.amount * 0.04)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Comissão AutoCred (2.5%)</span>
                  <span className="font-bold text-blue-800">
                    {formatCurrency(mockCreditFlow.amount * 0.025)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-emerald-200">
                  <span className="font-semibold text-slate-700">Total comissão</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(mockCreditFlow.amount * 0.065)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Link href="/financiamento">
            <Button className="w-full gap-2">
              Nova solicitação <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/simulador">
            <Button variant="outline" className="w-full gap-2">
              Simular financiamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Outros pedidos ativos */}
      <Card className="mt-6">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Outros pedidos em andamento</CardTitle>
          <Link href="/pipeline">
            <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
              Ver pipeline <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Serviço</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Parcelas</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.serviceType}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(r.requestedAmount)}</td>
                    <td className="px-4 py-3 text-slate-600">{r.installments}×</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${financingStatusColor[r.status]}`}>
                        {financingStatusLabel[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Por que automatizar */}
      <Card className="mt-6 bg-slate-900 text-white border-0">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-red-400">38%</p>
              <p className="text-sm text-slate-300 mt-1">dos clientes abandonam o reparo por falta de crédito</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">3–5 dias</p>
              <p className="text-sm text-slate-300 mt-1">tempo médio de aprovação sem AutoCred (processos manuais)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">&lt; 2 horas</p>
              <p className="text-sm text-slate-300 mt-1">tempo médio de aprovação via AutoCred, com triagem automática</p>
            </div>
          </div>
          <p className="mt-6 text-slate-400 text-sm leading-relaxed max-w-2xl">
            O AutoCred automatiza a triagem, encaminha ao parceiro ideal e notifica a oficina em tempo real.
            O cliente não sai sem resposta. O reparo não é perdido.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
