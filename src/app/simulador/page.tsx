"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPartners } from "@/data/mock";
import { formatCurrency, calculateInstallment, calculateCommissions } from "@/lib/utils";

const rateOptions = [
  { value: "0.0149", label: "1,49% a.m. — Creditas Auto" },
  { value: "0.0179", label: "1,79% a.m. — Sicoob" },
  { value: "0.0199", label: "1,99% a.m. — Banco Inter" },
  { value: "0.0219", label: "2,19% a.m. — Santander" },
  { value: "0.0249", label: "2,49% a.m." },
  { value: "0.0289", label: "2,89% a.m. — BV" },
];

const installmentOptions = [3, 6, 9, 12, 18, 24];

export default function SimuladorPage() {
  const [repairValue, setRepairValue] = useState(3500);
  const [downPayment, setDownPayment] = useState(0);
  const [installments, setInstallments] = useState(12);
  const [monthlyRate, setMonthlyRate] = useState(0.0199);
  const [selectedPartner, setSelectedPartner] = useState("p1");

  const amount = Math.max(0, repairValue - downPayment);
  const { installmentValue, totalCost, totalInterest } = calculateInstallment(repairValue, downPayment, installments, monthlyRate);
  const commissions = calculateCommissions(amount);
  const cet = ((Math.pow(1 + monthlyRate, 12) - 1) * 100);

  const ratePct = monthlyRate * 100;
  const approval = ratePct <= 1.79
    ? { label: "Alta probabilidade", cls: "bg-emerald-100 text-emerald-700" }
    : ratePct <= 2.19
      ? { label: "Média", cls: "bg-yellow-100 text-yellow-700" }
      : { label: "Análise necessária", cls: "bg-orange-100 text-orange-700" };

  const scenarios = [6, 12, 24].map((n) => {
    const calc = calculateInstallment(repairValue, downPayment, n, monthlyRate);
    return { n, ...calc, shopCommission: calculateCommissions(amount).shopCommission };
  });

  return (
    <DashboardLayout title="Simulador de Financiamento" subtitle="Calcule parcelas, comissões e perfil de aprovação">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUTS */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Parâmetros</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Valor do reparo</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range" min={500} max={50000} step={100} value={repairValue}
                  onChange={(e) => { const v = Number(e.target.value); setRepairValue(v); if (downPayment > v * 0.5) setDownPayment(0); }}
                  className="flex-1 accent-blue-600"
                />
                <Input type="number" className="w-32" value={repairValue} onChange={(e) => setRepairValue(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Entrada ({formatCurrency(downPayment)})</label>
              <input
                type="range" min={0} max={Math.round(repairValue * 0.5)} step={50} value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Parcelas</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {installmentOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() => setInstallments(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      installments === n ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Taxa de juros</label>
              <Select value={String(monthlyRate)} onValueChange={(v) => setMonthlyRate(Number(v))}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {rateOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Parceiro</label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockPartners.map((p) => <SelectItem key={p.id} value={p.id}>{p.logo} {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* RESULT */}
        <div className="fintech-gradient rounded-xl p-6 text-white">
          <p className="text-slate-300 text-sm">Parcela estimada</p>
          <p className="text-4xl font-bold mt-1">{installments}x de {formatCurrency(installmentValue)}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-300">Valor financiado</p>
              <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-300">Total a pagar</p>
              <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-300">Juros totais</p>
              <p className="text-lg font-semibold">{formatCurrency(totalInterest)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-300">CET estimado (a.a.)</p>
              <p className="text-lg font-semibold">{cet.toFixed(1)}%</p>
            </div>
          </div>

          <div className="border-t border-white/20 my-6" />

          <p className="text-sm font-medium text-slate-200">Receita gerada nesta operação</p>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Comissão da oficina (4%)</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-400 text-emerald-950">{formatCurrency(commissions.shopCommission)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Comissão AutoCred (2,5%)</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-400 text-blue-950">{formatCurrency(commissions.autocredCommission)}</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="text-sm">Total</span>
              <span>{formatCurrency(commissions.totalCommission)}</span>
            </div>
          </div>

          <div className="border-t border-white/20 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Probabilidade de aprovação</span>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${approval.cls}`}>{approval.label}</span>
          </div>

          <Link href="/financiamento" className="block mt-6">
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 gap-2">
              Iniciar solicitação para este cliente <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* COMPARISON */}
      <Card className="mt-6">
        <CardHeader className="pb-2"><CardTitle className="text-base">Comparativo de cenários</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-3">Parcelas</th>
                  <th className="py-2 pr-3">Parcela mensal</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Juros</th>
                  <th className="py-2 pr-3">Comissão oficina</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.n} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{s.n} parcelas</td>
                    <td className="py-2.5 pr-3">{formatCurrency(s.installmentValue)}</td>
                    <td className="py-2.5 pr-3">{formatCurrency(s.totalCost)}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{formatCurrency(s.totalInterest)}</td>
                    <td className="py-2.5 pr-3 text-emerald-600 font-medium">{formatCurrency(s.shopCommission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Aviso:</strong> Os valores apresentados são estimativas para fins de simulação. As taxas, parcelas e
          condições finais dependem da análise de crédito realizada pelo parceiro financeiro, sujeita à consulta de
          bureau e documentação. Esta simulação não representa oferta ou aprovação de crédito.
        </p>
      </div>
    </DashboardLayout>
  );
}
