"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, MessageCircle, TrendingUp } from "lucide-react";

const partnershipSteps = [
  "Oficina registra a solicitação de crédito no AutoCred",
  "AutoCred faz triagem automática de risco do cliente",
  "Lead qualificado é enviado ao parceiro financeiro",
  "Parceiro analisa e decide em até 2 horas",
  "Aprovação notificada — oficina autoriza reparo e recebe integral",
];

const tiposCredito = [
  { tipo: "Crédito pessoal", taxa: "1,79% – 2,89% a.m.", prazo: "até 24x", desc: "Sem garantia, aprovação mais rápida" },
  { tipo: "CDC (Crédito Direto ao Consumidor)", taxa: "1,49% – 2,19% a.m.", prazo: "até 36x", desc: "Vinculado ao serviço, taxa menor" },
  { tipo: "Crédito com garantia de veículo", taxa: "0,99% – 1,79% a.m.", prazo: "até 48x", desc: "Menor taxa, exige alienação" },
];

export default function ParceirosPage() {
  const whatsappUrl = `https://wa.me/5521999999999?text=${encodeURIComponent("Olá! Quero saber mais sobre os parceiros financeiros do AutoCred.")}`;

  return (
    <DashboardLayout title="Rede de Parceiros" subtitle="Instituições financeiras conectadas à plataforma AutoCred">

      <div className="max-w-4xl space-y-6">

        {/* Status da rede */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Rede em expansão</p>
                <p className="text-sm text-blue-700 mt-1">
                  Estamos fechando parcerias com instituições financeiras para oferecer crédito automotivo às oficinas da plataforma.
                  Em breve as opções de parceiros estarão disponíveis diretamente aqui.
                </p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="mt-3 gap-2 bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="w-4 h-4" /> Quero saber mais
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como funciona */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como funciona a rede de crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partnershipSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de crédito */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipos de crédito disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tiposCredito.map((t) => (
              <div key={t.tipo} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.tipo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{t.taxa}</p>
                    <p className="text-xs text-slate-400">{t.prazo}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vantagens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vantagens para a sua oficina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Comissão de 4% sobre cada financiamento aprovado",
              "Zero risco de inadimplência — o risco fica com o parceiro",
              "Cliente paga parcelado, oficina recebe integral",
              "Triagem automática de risco em menos de 1 minuto",
              "Sem burocracia — tudo digital pelo AutoCred",
            ].map((v) => (
              <div key={v} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {v}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-slate-900 border-0 text-white">
          <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold">Quer usar o crédito agora?</p>
              <p className="text-sm text-slate-300 mt-1">Crie um orçamento e use o simulador para mostrar ao cliente.</p>
            </div>
            <div className="flex gap-2">
              <a href="/simulador">
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
                  <Clock className="w-4 h-4 mr-2" /> Simulador
                </Button>
              </a>
              <a href="/financiamento">
                <Button className="bg-blue-600 hover:bg-blue-500">Nova pré-análise</Button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
