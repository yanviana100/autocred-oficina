import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QuoteStatus, FinancingStatus, RiskLevel, Plan } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export function formatDateFull(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ─── STATUS LABELS & COLORS ────────────────────────────────────────────────

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aguardando_aprovacao: "Ag. Aprovação",
  aguardando_financiamento: "Ag. Financiamento",
  pre_aprovado: "Pré-aprovado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  concluido: "Concluído",
};

export const quoteStatusColor: Record<QuoteStatus, string> = {
  rascunho: "bg-slate-100 text-slate-600",
  enviado: "bg-blue-100 text-blue-700",
  aguardando_aprovacao: "bg-yellow-100 text-yellow-700",
  aguardando_financiamento: "bg-orange-100 text-orange-700",
  pre_aprovado: "bg-indigo-100 text-indigo-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
  concluido: "bg-emerald-100 text-emerald-700",
};

export const financingStatusLabel: Record<FinancingStatus, string> = {
  novo: "Novo Pedido",
  em_analise: "Em Análise",
  documentos_pendentes: "Docs Pendentes",
  pre_aprovado: "Pré-aprovado",
  reprovado: "Reprovado",
  convertido: "Convertido",
};

export const financingStatusColor: Record<FinancingStatus, string> = {
  novo: "bg-slate-100 text-slate-700",
  em_analise: "bg-blue-100 text-blue-700",
  documentos_pendentes: "bg-yellow-100 text-yellow-700",
  pre_aprovado: "bg-indigo-100 text-indigo-700",
  reprovado: "bg-red-100 text-red-700",
  convertido: "bg-emerald-100 text-emerald-700",
};

export const riskLevelLabel: Record<RiskLevel, string> = {
  baixo: "Baixo Risco",
  medio: "Médio Risco",
  alto: "Alto Risco",
  manual: "Análise Manual",
};

export const riskLevelColor: Record<RiskLevel, string> = {
  baixo: "bg-emerald-100 text-emerald-700",
  medio: "bg-yellow-100 text-yellow-700",
  alto: "bg-red-100 text-red-700",
  manual: "bg-purple-100 text-purple-700",
};

export const planLabel: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  premium: "Premium",
};

export const planColor: Record<Plan, string> = {
  starter: "bg-slate-100 text-slate-700",
  pro: "bg-blue-100 text-blue-700",
  premium: "bg-violet-100 text-violet-700",
};

export const planPrice: Record<Plan, number> = {
  starter: 99,
  pro: 249,
  premium: 499,
};

// ─── CÁLCULO FINANCEIRO ────────────────────────────────────────────────────

export function calculateInstallment(
  principal: number,
  downPayment: number,
  installments: number,
  monthlyRate: number
): { installmentValue: number; totalCost: number; totalInterest: number } {
  const amount = Math.max(0, principal - downPayment);
  if (amount <= 0 || installments <= 0) {
    return { installmentValue: 0, totalCost: downPayment, totalInterest: 0 };
  }
  const r = monthlyRate;
  const installmentValue =
    (amount * r * Math.pow(1 + r, installments)) /
    (Math.pow(1 + r, installments) - 1);
  const totalCost = downPayment + installmentValue * installments;
  const totalInterest = totalCost - principal;
  return { installmentValue, totalCost, totalInterest };
}

// Commission model: AutoCred keeps 3.5% of financed amount
// Shop gets 2%, AutoCred keeps 1.5%
export const SHOP_COMMISSION_RATE = 0.04;     // 4% to shop
export const AUTOCRED_COMMISSION_RATE = 0.025; // 2.5% to AutoCred
export const TOTAL_COMMISSION_RATE = SHOP_COMMISSION_RATE + AUTOCRED_COMMISSION_RATE; // 6.5%

export function calculateCommissions(amount: number): {
  shopCommission: number;
  autocredCommission: number;
  totalCommission: number;
} {
  return {
    shopCommission: amount * SHOP_COMMISSION_RATE,
    autocredCommission: amount * AUTOCRED_COMMISSION_RATE,
    totalCommission: amount * TOTAL_COMMISSION_RATE,
  };
}

export function calcRiskLevel(
  monthlyIncome: number,
  hasIncomeProof: boolean,
  hasCreditRestriction: string,
  requestedAmount: number
): RiskLevel {
  if (hasCreditRestriction === "sim") return "alto";
  if (!hasIncomeProof && requestedAmount / (monthlyIncome * 12) > 0.3) return "alto";
  if (hasCreditRestriction === "nao_sei") return "manual";
  const ratio = requestedAmount / (monthlyIncome * 12);
  if (ratio < 0.12 && hasIncomeProof) return "baixo";
  if (ratio < 0.25) return "medio";
  return "alto";
}

// ─── MARKET DATA (TAM/SAM/SOM) ────────────────────────────────────────────

export const marketData = {
  totalWorkshopsBrasil: 550_000,
  autoRepairMarketBRL: 87_000_000_000, // R$ 87 bilhões
  avgRepairTicket: 1_840,
  percentWithoutCredit: 0.38,           // 38% não fecham por falta de crédito
  tam: 87_000_000_000,                  // Total market
  samWorkshops: 55_000,                 // Top 10% com ticket > R$ 1.500
  samMarket: 8_700_000_000,             // SAM = 10% do TAM
  somYear3Penetration: 0.01,            // 1% penetração em 3 anos
  som: 87_000_000,
};
