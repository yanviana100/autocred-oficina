"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPartners } from "@/data/mock";
import { formatCurrencyShort } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

const typeBadge: Record<string, string> = {
  banco: "bg-blue-100 text-blue-700",
  fintech: "bg-green-100 text-green-700",
  cooperativa: "bg-orange-100 text-orange-700",
};

const typeLabel: Record<string, string> = {
  banco: "Banco",
  fintech: "Fintech",
  cooperativa: "Cooperativa",
};

const partnershipSteps = [
  "Oficina registra solicitação no AutoCred",
  "AutoCred faz triagem e envia ao parceiro ideal",
  "Parceiro analisa e decide em horas",
  "Aprovação notificada, oficina autoriza reparo, recebe integral",
];

export default function ParceirosPage() {
  return (
    <DashboardLayout title="Rede de Parceiros" subtitle="Instituições financeiras conectadas à plataforma AutoCred">
      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">4</p><p className="text-sm text-slate-500">parceiros ativos</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">R$21,6M</p><p className="text-sm text-slate-500">capacidade/mês</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">3 tipos</p><p className="text-sm text-slate-500">banco, fintech, cooperativa</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">67%</p><p className="text-sm text-slate-500">aprovação média</p></CardContent></Card>
      </div>

      {/* PARTNERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {mockPartners.map((p) => (
          <Card key={p.id} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{p.logo}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[p.type]}`}>
                      {typeLabel[p.type]}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div><p className="text-xs text-slate-500">Taxa média</p><p className="font-semibold text-sm">{p.avgRate.toFixed(2)}%</p></div>
                <div><p className="text-xs text-slate-500">Aprovação</p><p className="font-semibold text-sm">{p.approvalRate}%</p></div>
                <div><p className="text-xs text-slate-500">Capacidade</p><p className="font-semibold text-sm">{formatCurrencyShort(p.monthlyCapacity)}</p></div>
                <div><p className="text-xs text-slate-500">Prazo máx</p><p className="font-semibold text-sm">{p.maxInstallments}x</p></div>
              </div>

              <div className="mt-4 space-y-2">
                {p.products.map((prod) => (
                  <div key={prod.name} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{prod.name}</p>
                      {prod.requiresProof && (
                        <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Exige comprovante</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>{prod.minRate.toFixed(2)}% – {prod.maxRate.toFixed(2)}% a.m.</span>
                      <span>até {prod.maxInstallments}x</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prod.turnaroundHours}h</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" disabled={!p.active}>
                Solicitar via este parceiro
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* HOW PARTNERSHIP WORKS */}
      <Card className="mt-6">
        <CardHeader className="pb-2"><CardTitle className="text-base">Como funciona a parceria</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {partnershipSteps.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <p className="text-sm text-slate-700 mt-3">{s}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-6 rounded-xl p-8 fintech-gradient text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Quer distribuir crédito via AutoCred?</h3>
          <p className="text-slate-300 mt-1 max-w-xl">
            Conecte sua instituição a uma rede de oficinas com demanda qualificada e clientes pré-triados. Zero CAC, integração digital.
          </p>
        </div>
        <Button className="bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Seja um parceiro
        </Button>
      </div>
    </DashboardLayout>
  );
}
