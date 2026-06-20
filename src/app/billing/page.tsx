"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Star, Crown, MessageCircle, Calendar, AlertTriangle } from "lucide-react";
import { getSupabase, getWorkshopId } from "@/lib/db";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "R$150",
    icon: Zap,
    color: "border-slate-200",
    iconColor: "text-slate-500",
    features: [
      "Até 30 orçamentos/mês",
      "Cadastro de clientes e veículos",
      "Ordens de serviço",
      "Página pública de orçamento",
      "Simulador de crédito",
      "Relatórios básicos",
      "Suporte por email",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$250",
    icon: Star,
    color: "border-blue-500 ring-2 ring-blue-500",
    iconColor: "text-blue-600",
    highlight: true,
    features: [
      "Orçamentos ilimitados",
      "Tudo do Starter",
      "Relatórios avançados",
      "Pipeline de crédito",
      "Histórico completo de OS",
      "Suporte prioritário",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "R$399",
    icon: Crown,
    color: "border-amber-400",
    iconColor: "text-amber-500",
    features: [
      "Tudo do Pro",
      "Usuários ilimitados",
      "NF-e integrado (em breve)",
      "Relatórios personalizados",
      "Gerente de conta dedicado",
      "Integração via API",
    ],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("workshops").select("plan, trial_ends_at").eq("id", workshopId).single();
      if (data) {
        setCurrentPlan(data.plan ?? "starter");
        setTrialEndsAt(data.trial_ends_at ?? null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const whatsappMsg = encodeURIComponent("Olá! Quero fazer upgrade do meu plano no AutoCred. Pode me ajudar?");
  const whatsappUrl = `https://wa.me/5511999999999?text=${whatsappMsg}`;

  return (
    <DashboardLayout title="Planos e Cobrança" subtitle="Gerencie sua assinatura">
      <div className="max-w-5xl space-y-6">

        {/* Status atual */}
        <Card className={`${trialDaysLeft !== null && trialDaysLeft <= 3 ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {trialDaysLeft !== null && trialDaysLeft <= 3
                ? <AlertTriangle className="w-5 h-5 text-red-500" />
                : <Calendar className="w-5 h-5 text-blue-600" />
              }
              <div>
                {loading ? (
                  <div className="h-4 w-48 bg-slate-200 animate-pulse rounded" />
                ) : trialDaysLeft !== null ? (
                  <>
                    <p className="font-semibold text-slate-900">
                      {trialDaysLeft === 0 ? "Período de teste encerrado" : `Período de teste: ${trialDaysLeft} dia(s) restantes`}
                    </p>
                    <p className="text-sm text-slate-500">Faça upgrade para continuar usando o AutoCred</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-slate-900">Plano atual: <span className="text-blue-700">{plans.find(p => p.key === currentPlan)?.name}</span></p>
                    <p className="text-sm text-slate-500">Para alterar seu plano, entre em contato com o suporte</p>
                  </>
                )}
              </div>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4" /> Falar com suporte
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Cards de plano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.key === currentPlan;
            return (
              <Card key={plan.key} className={`relative ${plan.color} ${plan.highlight ? "shadow-lg" : ""}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Mais popular</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Plano atual</span>
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>Plano atual</Button>
                  ) : (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className={`w-full ${plan.highlight ? "bg-blue-600 hover:bg-blue-500" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                        Fazer upgrade
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Como faço o pagamento?</p>
              <p className="mt-1">Entre em contato pelo WhatsApp. Aceitamos Pix e boleto mensal.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Posso cancelar a qualquer momento?</p>
              <p className="mt-1">Sim. Sem multa ou fidelidade. Avise com 30 dias de antecedência.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">O que acontece com meus dados se eu cancelar?</p>
              <p className="mt-1">Seus dados ficam disponíveis por 30 dias após o cancelamento para exportação.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
