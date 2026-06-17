"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, User, Car, Wrench, CreditCard, Share2, FileText, AlertTriangle, TrendingDown,
} from "lucide-react";
import { mockQuotes } from "@/data/mock";
import { formatCurrency, formatDate, quoteStatusLabel, quoteStatusColor, calculateInstallment } from "@/lib/utils";

const INTEREST_RATE = 0.0199; // 1.99% ao mês (simulado)

export default function OrcamentoDetailPage() {
  const { id } = useParams();
  const quote = mockQuotes.find((q) => q.id === id);

  const [showSimulator, setShowSimulator] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [installments, setInstallments] = useState(12);

  if (!quote) {
    return (
      <DashboardLayout title="Orçamento não encontrado">
        <Link href="/orcamentos"><Button variant="ghost">Voltar</Button></Link>
      </DashboardLayout>
    );
  }

  const { installmentValue, totalCost } = calculateInstallment(
    quote.totalValue,
    downPayment,
    installments,
    INTEREST_RATE
  );

  const financedAmount = quote.totalValue - downPayment;

  return (
    <DashboardLayout title={`Orçamento — ${quote.customerName}`} subtitle={`Criado em ${formatDate(quote.createdAt)}`}>
      <Link href="/orcamentos">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl">
        <div className="xl:col-span-2 space-y-5">
          {/* Header info */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">{quote.serviceType}</h2>
                    <p className="text-sm text-slate-500">{quote.vehicleInfo}</p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${quoteStatusColor[quote.status]}`}>
                  {quoteStatusLabel[quote.status]}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cliente e Veículo */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Cliente</span>
                </div>
                <p className="font-semibold text-slate-900">{quote.customerName}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Veículo</span>
                </div>
                <p className="font-semibold text-slate-900">{quote.vehicleInfo}</p>
              </CardContent>
            </Card>
          </div>

          {/* Diagnóstico */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wrench className="w-4 h-4" /> Diagnóstico e Descrição</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">{quote.problemDescription}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <span>⏱ Prazo estimado: <strong>{quote.estimatedDays} dia(s)</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Itens do Orçamento</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500 text-xs">
                    <th className="pb-2">Descrição</th>
                    <th className="pb-2 text-center">Tipo</th>
                    <th className="pb-2 text-center">Qtd</th>
                    <th className="pb-2 text-right">Unit.</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-2">{item.description}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${item.type === "peca" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {item.type === "peca" ? "Peça" : "M.O."}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr>
                    <td colSpan={4} className="pt-3 text-right font-bold text-slate-900">Total do orçamento</td>
                    <td className="pt-3 text-right font-bold text-xl text-blue-600">{formatCurrency(quote.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ações */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Ações</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => setShowSimulator(!showSimulator)}
              >
                <CreditCard className="w-4 h-4" />
                Simular Financiamento
              </Button>
              <Link href={`/orcamento/publico?token=${quote.publicToken}`} target="_blank">
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="w-4 h-4" /> Link do Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Simulador */}
          {showSimulator && (
            <Card className="border-2 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> Simulador de Financiamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Simulação apenas.</strong> A aprovação depende de análise de crédito por parceiro financeiro autorizado. Valores aproximados.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Valor do reparo</Label>
                  <Input value={formatCurrency(quote.totalValue)} disabled className="bg-slate-50 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Entrada (opcional)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={quote.totalValue}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    placeholder="R$ 0,00"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Número de parcelas</Label>
                  <Select
                    value={String(installments)}
                    onValueChange={(v) => setInstallments(Number(v))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 6, 9, 12, 18, 24].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Valor financiado</span>
                    <span className="font-medium">{formatCurrency(financedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Taxa simulada</span>
                    <span className="font-medium">{(INTEREST_RATE * 100).toFixed(2)}% a.m.</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Custo total estimado</span>
                    <span className="font-medium">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Parcela estimada</span>
                    <span className="text-xl font-bold text-green-700">
                      {installments}x {formatCurrency(installmentValue)}
                    </span>
                  </div>
                </div>

                <Link href={`/financiamento?quoteId=${quote.id}`}>
                  <Button className="w-full text-sm bg-green-600 hover:bg-green-700">
                    Iniciar pré-análise do cliente
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Este orçamento tem validade de 7 dias. Para dúvidas, entre em contato com a oficina.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
