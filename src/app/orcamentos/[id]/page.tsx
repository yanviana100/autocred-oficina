"use client";
import { use } from "react";
import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Car, FileText, CreditCard, Share2, CheckCircle, Copy } from "lucide-react";
import { useQuotes } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, quoteStatusLabel, quoteStatusColor } from "@/lib/utils";
import type { QuoteStatus } from "@/types";

const statusFlow: QuoteStatus[] = ["rascunho", "enviado", "aguardando_aprovacao", "aprovado", "concluido"];

export default function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { get, update, approve } = useQuotes();
  const { toast } = useToast();
  const [quote, setQuote] = useState(() => get(id));

  if (!quote) {
    return (
      <DashboardLayout title="Orçamento não encontrado" subtitle="">
        <p className="text-sm text-slate-500 mb-4">Este orçamento não existe ou foi removido.</p>
        <Link href="/orcamentos"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link>
      </DashboardLayout>
    );
  }

  const handleStatusChange = (newStatus: QuoteStatus) => {
    if (newStatus === "aprovado") {
      const result = approve(quote.id);
      if (result) {
        setQuote(result.quote);
        toast(`Orçamento aprovado! OS ${result.serviceOrder.osNumber} criada automaticamente.`);
      }
    } else {
      const updated = update(quote.id, { status: newStatus });
      if (updated) { setQuote(updated); toast("Status atualizado!"); }
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/orcamento/publico?token=${quote.publicToken}`;
    navigator.clipboard.writeText(url).then(() => toast("Link copiado!"));
  };

  const totalPecas     = quote.items.filter((i) => i.type === "peca").reduce((s, i) => s + i.total, 0);
  const totalMaoDeObra = quote.items.filter((i) => i.type === "mao_de_obra").reduce((s, i) => s + i.total, 0);

  return (
    <DashboardLayout title={`Orçamento — ${quote.customerName}`} subtitle={`Criado em ${formatDate(quote.createdAt)}`}>
      <Link href="/orcamentos">
        <Button variant="ghost" size="sm" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Voltar</Button>
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl">
        <div className="xl:col-span-2 space-y-5">
          {/* Header */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{quote.serviceType}</h2>
                    <p className="text-sm text-slate-500">{quote.vehicleInfo}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${quoteStatusColor[quote.status]}`}>
                  {quoteStatusLabel[quote.status]}
                </span>
              </div>
              {quote.problemDescription && (
                <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{quote.problemDescription}</p>
              )}
            </CardContent>
          </Card>

          {/* Dados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div><p className="text-xs text-slate-500">Cliente</p><p className="font-semibold">{quote.customerName}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Car className="w-5 h-5 text-blue-500" />
                <div><p className="text-xs text-slate-500">Veículo</p><p className="font-semibold text-sm">{quote.vehicleInfo}</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Itens */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Itens do orçamento</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-xs text-slate-400">
                    <th className="pb-2">Descrição</th><th className="pb-2">Tipo</th><th className="pb-2 text-center">Qtd</th><th className="pb-2 text-right">Unit.</th><th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-3 font-medium">{item.description}</td>
                      <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded text-xs ${item.type === "peca" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>{item.type === "peca" ? "Peça" : "M.O."}</span></td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right text-slate-500">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr><td colSpan={4} className="pt-3 text-slate-500">Peças</td><td className="pt-3 text-right font-medium">{formatCurrency(totalPecas)}</td></tr>
                  <tr><td colSpan={4} className="pb-1 text-slate-500">Mão de obra</td><td className="pb-1 text-right font-medium">{formatCurrency(totalMaoDeObra)}</td></tr>
                  <tr className="text-lg font-bold border-t"><td colSpan={4} className="pt-2">Total</td><td className="pt-2 text-right text-blue-600">{formatCurrency(quote.totalValue)}</td></tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar ações */}
        <div className="space-y-4">
          {/* Alterar status */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Alterar status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Select value={quote.status} onValueChange={(v) => handleStatusChange(v as QuoteStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusFlow.map((s) => <SelectItem key={s} value={s}>{quoteStatusLabel[s]}</SelectItem>)}
                  <SelectItem value="recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
              {(quote.status === "enviado" || quote.status === "aguardando_aprovacao") && (
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange("aprovado")}>
                  <CheckCircle className="w-4 h-4" />Aprovar orçamento
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Resumo financeiro */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Prazo</span><span className="font-medium">{quote.estimatedDays} dia{quote.estimatedDays !== 1 ? "s" : ""}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Peças</span><span className="font-medium">{formatCurrency(totalPecas)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mão de obra</span><span className="font-medium">{formatCurrency(totalMaoDeObra)}</span></div>
              <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span className="text-blue-600">{formatCurrency(quote.totalValue)}</span></div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full gap-2" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />Copiar link do cliente
            </Button>
            <Link href={`/orcamento/publico?token=${quote.publicToken}`} target="_blank">
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />Ver página do cliente
              </Button>
            </Link>
            <Link href={`/financiamento?quoteId=${quote.id}&amount=${quote.totalValue}`}>
              <Button className="w-full gap-2 mt-1">
                <CreditCard className="w-4 h-4" />Solicitar crédito
              </Button>
            </Link>
          </div>

          {quote.notes && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4"><p className="text-xs text-amber-800"><strong>Obs:</strong> {quote.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
