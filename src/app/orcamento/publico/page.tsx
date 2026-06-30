"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, Car, CheckCircle, Phone, PenLine, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, quoteStatusLabel, quoteStatusColor } from "@/lib/utils";
import { getSupabase } from "@/lib/db";

function OrcamentoPublicoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [workshop, setWorkshop] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signError, setSignError] = useState("");

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

  const handleSign = async () => {
    if (!signerName.trim()) { setSignError("Digite seu nome completo para assinar."); return; }
    if (!token) return;
    setSigning(true);
    setSignError("");
    const supabase = getSupabase();
    const { data } = await supabase.rpc("sign_quote_by_token", {
      p_token: token,
      p_signed_by: signerName.trim(),
    });
    setSigning(false);
    if (data?.error === "already_approved") { setSignError("Este orçamento já foi aprovado."); return; }
    if (data?.error === "already_signed") { setSignError("Este orçamento já foi assinado."); return; }
    if (data?.success) { setSigned(true); return; }
    setSignError("Erro ao registrar assinatura. Tente novamente.");
  };

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

        {/* Bloco de assinatura digital */}
        {["enviado", "aguardando_aprovacao"].includes(status) && !signed && !(quote["signed_at"] as string | null) && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <PenLine className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">Aprovar orçamento</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Digite seu nome completo abaixo para confirmar a aprovação deste orçamento. A oficina receberá sua confirmação e entrará em contato.
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Nome completo *</Label>
                <Input
                  placeholder="Ex: João da Silva"
                  value={signerName}
                  onChange={(e) => { setSignerName(e.target.value); setSignError(""); }}
                  disabled={signing}
                  className="text-base"
                />
              </div>
              {signError && <p className="text-sm text-red-500">{signError}</p>}
              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleSign}
                disabled={signing || !signerName.trim()}
              >
                {signing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Registrando...</>
                ) : (
                  <><PenLine className="w-4 h-4" />Assinar e aprovar orçamento</>
                )}
              </Button>
              <div className="flex items-center gap-1.5 justify-center text-xs text-slate-400">
                <Lock className="w-3 h-3" /> Sua assinatura é registrada com data, hora e IP
              </div>
            </div>
          </div>
        )}

        {/* Orçamento já assinado */}
        {(signed || ((quote["signed_at"] as string | null) && ["aguardando_aprovacao", "aprovado"].includes(status))) && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h2 className="font-bold text-emerald-900 text-lg mb-1">Orçamento aprovado!</h2>
            <p className="text-sm text-emerald-700">
              {signed
                ? "Sua aprovação foi registrada. A oficina entrará em contato em breve."
                : `Assinado por ${String(quote["signed_by"] ?? "")}. A oficina já foi notificada.`}
            </p>
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
          Orçamento gerado por <span className="font-medium text-slate-500">OficinaPro</span> · Sistema de gestão para oficinas mecânicas
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
