"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Clock, ArrowRight, User, Car, DollarSign,
  AlertCircle, Zap, Building2,
} from "lucide-react";

const steps = [
  {
    id: 1, icon: User, status: "done",
    label: "Cadastro do cliente",
    description: "Oficina cadastra o cliente e seu veículo no sistema.",
    time: "1 min",
  },
  {
    id: 2, icon: Car, status: "done",
    label: "Orçamento criado",
    description: "Oficina lança o orçamento com peças e mão de obra.",
    time: "2 min",
  },
  {
    id: 3, icon: DollarSign, status: "done",
    label: "Link enviado ao cliente",
    description: "Cliente recebe o link do orçamento e pode simular o parcelamento.",
    time: "imediato",
  },
  {
    id: 4, icon: AlertCircle, status: "active",
    label: "Pré-análise de crédito",
    description: "Cliente preenche pré-cadastro. Sistema faz triagem automática de risco.",
    time: "em andamento",
  },
  {
    id: 5, icon: Building2, status: "pending",
    label: "Encaminhamento ao parceiro",
    description: "Lead qualificado é encaminhado ao parceiro financeiro adequado.",
    time: "pendente",
  },
  {
    id: 6, icon: CheckCircle, status: "pending",
    label: "Aprovação e pagamento",
    description: "Parceiro aprova. Oficina recebe o valor integral. Cliente paga parcelado.",
    time: "pendente",
  },
  {
    id: 7, icon: Zap, status: "pending",
    label: "Comissão gerada",
    description: "Comissão de 4% creditada para a oficina após conversão.",
    time: "pendente",
  },
];

export default function FluxoPage() {
  return (
    <DashboardLayout title="Fluxo de Crédito" subtitle="Como funciona o processo de aprovação">
      <div className="max-w-4xl grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Stepper */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Etapas do processo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-0">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = step.status === "done";
                    const isActive = step.status === "active";
                    const isPending = step.status === "pending";
                    return (
                      <div key={step.id} className="relative flex gap-5">
                        {idx > 0 && (
                          <div
                            className="absolute left-6 -top-4 w-0.5 h-4"
                            style={{ background: steps[idx - 1].status === "done" ? "#10b981" : "#e2e8f0" }}
                          />
                        )}
                        <div className="relative z-10 pb-8 flex-shrink-0">
                          {isDone ? (
                            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          ) : isActive ? (
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-400">{step.id}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pb-8 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-semibold text-sm ${isDone ? "text-emerald-700" : isActive ? "text-blue-700" : "text-slate-400"}`}>
                                  {step.label}
                                </h3>
                                {isDone && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Concluído</span>}
                                {isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium animate-pulse">Em andamento</span>}
                              </div>
                              <p className={`text-sm mt-1 leading-relaxed ${isPending ? "text-slate-300" : "text-slate-500"}`}>
                                {step.description}
                              </p>
                            </div>
                            <span className={`text-xs font-mono flex-shrink-0 ${isPending ? "text-slate-300" : "text-slate-400"}`}>
                              {step.time}
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

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tempo médio de aprovação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Triagem automática", value: "< 1 minuto", color: "text-blue-600" },
                { label: "Decisão do parceiro", value: "até 2 horas", color: "text-emerald-600" },
                { label: "Processo manual (sem AutoCred)", value: "3–5 dias", color: "text-red-500" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">Comissões estimadas</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Oficina (4%)</span>
                  <span className="font-bold text-emerald-800">sobre cada conversão</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">AutoCred (2.5%)</span>
                  <span className="font-bold text-blue-800">plataforma</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Link href="/financiamento">
              <Button className="w-full gap-2">Nova pré-análise <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/simulador">
              <Button variant="outline" className="w-full gap-2">Simular financiamento</Button>
            </Link>
          </div>

          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-5 space-y-3">
              <div><p className="text-2xl font-bold text-red-400">38%</p><p className="text-xs text-slate-300 mt-0.5">dos clientes abandonam o reparo por falta de crédito</p></div>
              <div><p className="text-2xl font-bold text-emerald-400">&lt; 2h</p><p className="text-xs text-slate-300 mt-0.5">tempo médio de aprovação via AutoCred</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
