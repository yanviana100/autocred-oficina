"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, Car, CheckCircle, CreditCard, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, quoteStatusLabel, quoteStatusColor, calculateInstallment } from "@/lib/utils";
import { getSupabase } from "@/lib/db";

const INTEREST_RATE = 0.0199;

function OrcamentoPublicoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [workshop, setWorkshop] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showInterest, setShowInterest] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [installments, setInstallments] = useState(12);

  useEffect(() => {
    async function load() {
      if (!token) { setLoading(false); return; }
      const supabase = getSupabase();
      const { data: q } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("public_token", token)
        .single();
      if (q) {
        setQuote(q);
        const { data: w } = await supabase.from("workshops").select("name, city, state, whatsapp").eq("id", q.workshop_id).single();
        setWorkshop(w);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando orçamento...</div>;
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Orçamento não encontrado.</p>
          <p className="text-slate-400 text-sm mt-1">Verifique o link com a oficina.</p>
        </div>
      </div>
    );
  }

  const totalValue = Number(quote.total_value);
  const items = (quote.quote_items as Record<string, unknown>[]) ?? [];
  const { installmentValue, totalCost } = calculateInstallment(totalValue, downPayment, installments, INTEREST_RATE);
  const status = String(quote.status ?? "rascunho") as keyof typeof quoteStatusLabel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{String(workshop?.name ?? "Oficina")}</p>
            <p className="text-xs text-slate-500">{String(workshop?.city ?? "")}{workshop?.state ? `, ${workshop.state}` : ""}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Seu Orçamento</h1>
              <p className="text-sm text-slate-500 mt-0.5">{String(quote.service_type ?? "")}</p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${quoteStatusColor[status] ?? ""}`}>
              {quoteStatusLabel[status] ?? status}
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-5">
            <Car className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-semibold text-slate-900">{String(quote.vehicle_info ?? "")}</p>
              <p className="text-xs text-slate-500">{String(quote.service_type ?? "")}</p>
            </div>
          </div>

          {!!quote.problem_description && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição do serviço</p>
              <p className="text-sm text-slate-700 leading-relaxed">{String(quote.problem_description)}</p>
            </div>
          )}

          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Itens</p>
            <div className="divide-y border rounded-xl overflow-hidden">
              {items.map((item) => (
                <div key={String(item.id)} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{String(item.description)}</p>
                    <p className="text-xs text-slate-500">{item.type === "peca" ? "Peça" : "Mão de obra"} × {Number(item.quantity)}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCurrency(Number(item.total))}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-sm text-slate-600">Valor total do serviço</p>
              <p className="text-xs text-slate-400">Prazo estimado: {Number(quote.estimated_days)} dia(s)</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-slate-900 mb-4">Como deseja pagar?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <CheckCircle className="w-6 h-6 text-slate-400" />
              <span className="font-semibold text-sm text-slate-700">À vista</span>
              <span className="text-xs text-slate-500">{formatCurrency(totalValue)}</span>
            </button>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${showSimulator ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-green-400 hover:bg-green-50"}`}
            >
              <CreditCard className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-sm text-slate-700">Parcelado</span>
              <span className="text-xs text-slate-500">Simular parcelas</span>
            </button>
          </div>
        </div>

        {showSimulator && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-green-600" /> Simulação de Parcelamento
            </h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Simulação apenas.</strong> Esta é uma estimativa. A aprovação depende de análise de crédito por parceiro financeiro autorizado.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Entrada (opcional)</Label>
                <Input type="number" min={0} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Número de parcelas</Label>
                <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[3, 6, 9, 12, 18, 24].map((n) => <SelectItem key={n} value={String(n)}>{n}x</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Parcela estimada</p>
                <p className="text-3xl font-bold text-green-700">{installments}x de {formatCurrency(installmentValue)}</p>
                <p className="text-xs text-slate-400 mt-1">Total estimado: {formatCurrency(totalCost)} · Taxa: {(INTEREST_RATE * 100).toFixed(2)}% a.m.</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowInterest(true)}>
              <CreditCard className="w-4 h-4" /> Tenho interesse em financiar
            </Button>
            {showInterest && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">Interesse registrado!</p>
                </div>
                <p className="text-sm text-blue-700">Entre em contato com a oficina para iniciar o processo:</p>
                {!!workshop?.whatsapp && (
                  <a href={`https://wa.me/55${String(workshop.whatsapp).replace(/\D/g, "")}`} target="_blank" className="mt-3 flex items-center gap-2 w-fit text-sm font-medium text-green-700 hover:text-green-800">
                    <Phone className="w-4 h-4" /> {String(workshop.whatsapp)}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {!!workshop?.whatsapp && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center">
            <p className="text-sm text-slate-600 mb-3">Dúvidas? Fale com a oficina:</p>
            <a
              href={`https://wa.me/55${String(workshop.whatsapp).replace(/\D/g, "")}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> Chamar no WhatsApp
            </a>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-6">
          AutoCred Oficina © 2024 · Esta plataforma não realiza operações financeiras. Simulações são apenas estimativas e não representam oferta de crédito.
        </p>
      </main>
    </div>
  );
}

export default function OrcamentoPublicoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando orçamento...</div>}>
      <OrcamentoPublicoContent />
    </Suspense>
  );
}
