"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle, XCircle, Clock, CreditCard, User,
  ShieldCheck, ArrowRight, Info,
} from "lucide-react";
import { useFinancingRequests } from "@/hooks/useStore";
import { formatCurrency, formatDate, financingStatusLabel, financingStatusColor, riskLevelLabel, riskLevelColor, calcRiskLevel } from "@/lib/utils";
import { getSupabase, getWorkshopId } from "@/lib/db";
import type { RiskLevel } from "@/types";

type FormState = {
  fullName: string;
  cpf: string;
  birthDate: string;
  monthlyIncome: string;
  profession: string;
  hasIncomeProof: string;
  hasCreditRestriction: string;
  requestedAmount: string;
  installments: string;
  termsAccepted: boolean;
};

const initialForm: FormState = {
  fullName: "", cpf: "", birthDate: "", monthlyIncome: "", profession: "",
  hasIncomeProof: "", hasCreditRestriction: "", requestedAmount: "", installments: "12",
  termsAccepted: false,
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const Icon = level === "baixo" ? CheckCircle : level === "alto" ? XCircle : level === "manual" ? Clock : AlertTriangle;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${riskLevelColor[level]}`}>
      <Icon className="w-5 h-5" />
      {riskLevelLabel[level]}
    </div>
  );
}

export default function FinanciamentoPage() {
  const { requests, create: createRequest } = useFinancingRequests();
  const [tab, setTab] = useState<"lista" | "nova">("lista");
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<RiskLevel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [workshopName, setWorkshopName] = useState("Minha Oficina");

  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("workshops").select("name").eq("id", workshopId).single();
      if (data?.name) setWorkshopName(data.name);
    }
    load();
  }, []);

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const risk = calcRiskLevel(
      Number(form.monthlyIncome),
      form.hasIncomeProof === "sim",
      form.hasCreditRestriction,
      Number(form.requestedAmount)
    );
    const amt = Number(form.requestedAmount);
    const inst = Number(form.installments);
    createRequest({
      workshopId: (await getWorkshopId()) ?? "",
      customerId: "",
      quoteId: "",
      customerName: form.fullName,
      workshopName,
      serviceType: "Serviço de oficina",
      requestedAmount: amt,
      installments: inst,
      estimatedInstallment: Math.round((amt / inst) * 100) / 100,
      status: risk === "alto" ? "reprovado" : risk === "baixo" ? "pre_aprovado" : "em_analise",
      riskLevel: risk,
      fullName: form.fullName,
      cpf: form.cpf,
      birthDate: form.birthDate,
      monthlyIncome: Number(form.monthlyIncome),
      profession: form.profession,
      hasIncomeProof: form.hasIncomeProof === "sim",
      hasCreditRestriction: form.hasCreditRestriction as "sim" | "nao" | "nao_sei",
      termsAccepted: form.termsAccepted,
      shopCommission: amt * 0.04,
      autocredCommission: amt * 0.025,
    });
    setResult(risk);
    setSubmitting(false);
  };

  return (
    <DashboardLayout title="Financiamento" subtitle="Pré-análise e gestão de solicitações">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        {(["lista", "nova"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t === "lista" ? "Solicitações" : "Nova pré-análise"}
          </button>
        ))}
      </div>

      {tab === "lista" && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            {[
              {
                label: "Volume total",
                value: formatCurrency(requests.reduce((s, f) => s + f.requestedAmount, 0)),
                sub: "solicitado",
                color: "text-blue-600",
              },
              {
                label: "Comissão oficina (4%)",
                value: formatCurrency(requests.reduce((s, f) => s + (f.shopCommission ?? 0), 0)),
                sub: "estimada total",
                color: "text-emerald-600",
              },
              {
                label: "Taxa de aprovação",
                value: `${Math.round((requests.filter((f) => ["pre_aprovado", "convertido"].includes(f.status)).length / requests.length) * 100)}%`,
                sub: "pré-aprovados",
                color: "text-violet-600",
              },
              {
                label: "Ticket médio",
                value: formatCurrency(requests.reduce((s, f) => s + f.requestedAmount, 0) / requests.length),
                sub: "por solicitação",
                color: "text-amber-600",
              },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(["novo", "em_analise", "pre_aprovado", "convertido"] as const).map((s) => {
              const count = requests.filter((f) => f.status === s).length;
              return (
                <Card key={s}>
                  <CardContent className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${financingStatusColor[s]}`}>
                      {financingStatusLabel[s]}
                    </span>
                    <p className="text-2xl font-bold">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-3">
            {requests.map((f) => (
              <Card key={f.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{f.customerName}</h3>
                        <p className="text-sm text-slate-500">{f.serviceType} · {formatDate(f.createdAt)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">CPF: {f.cpf}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${riskLevelColor[f.riskLevel]}`}>
                        {riskLevelLabel[f.riskLevel]}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${financingStatusColor[f.status]}`}>
                        {financingStatusLabel[f.status]}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Valor solicitado</p>
                      <p className="font-bold text-slate-900">{formatCurrency(f.requestedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Parcelas</p>
                      <p className="font-bold text-slate-900">{f.installments}x {formatCurrency(f.estimatedInstallment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Renda informada</p>
                      <p className="font-bold text-slate-900">{formatCurrency(f.monthlyIncome)}/mês</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Parceiro</p>
                      <p className="font-medium text-slate-700 text-xs">{f.partnerName ?? "—"}</p>
                    </div>
                  </div>
                  {/* Commission strip */}
                  {(f.shopCommission || f.autocredCommission) && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Comissão oficina: {formatCurrency(f.shopCommission ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        AutoCred: {formatCurrency(f.autocredCommission ?? 0)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "nova" && (
        <div className="max-w-2xl">
          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Formulário de Pré-análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2 mb-6">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Esta pré-análise é uma <strong>triagem interna</strong>. O resultado não representa aprovação de crédito. A análise real é feita por parceiro financeiro autorizado após envio da documentação.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Nome completo *</Label>
                      <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CPF *</Label>
                      <Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => update("cpf", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Data de nascimento *</Label>
                      <Input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Renda mensal aproximada (R$) *</Label>
                      <Input type="number" min={0} placeholder="3000" value={form.monthlyIncome} onChange={(e) => update("monthlyIncome", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Profissão *</Label>
                      <Input placeholder="Ex: Motorista de aplicativo" value={form.profession} onChange={(e) => update("profession", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Possui comprovante de renda? *</Label>
                      <Select onValueChange={(v) => update("hasIncomeProof", v)} required>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Possui restrição no CPF? *</Label>
                      <Select onValueChange={(v) => update("hasCreditRestriction", v)} required>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao">Não</SelectItem>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao_sei">Não sei</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Valor desejado (R$) *</Label>
                      <Input type="number" min={100} placeholder="2500" value={form.requestedAmount} onChange={(e) => update("requestedAmount", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Parcelas desejadas *</Label>
                      <Select defaultValue="12" onValueChange={(v) => update("installments", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[3, 6, 9, 12, 18, 24].map((n) => <SelectItem key={n} value={String(n)}>{n}x</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-0.5"
                      checked={form.termsAccepted}
                      onChange={(e) => update("termsAccepted", e.target.checked)}
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                      Concordo que os dados informados serão utilizados exclusivamente para triagem interna e pré-cadastro junto a parceiros financeiros autorizados. Entendo que isso não representa aprovação de crédito.
                    </label>
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={submitting || !form.termsAccepted}>
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analisando perfil...
                      </div>
                    ) : (
                      <>Realizar pré-análise <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Pré-análise Concluída</h2>
                  <p className="text-slate-500 text-sm">Cliente: <strong>{form.fullName}</strong></p>
                </div>

                <div className="flex justify-center">
                  <RiskBadge level={result} />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl text-left space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Renda informada</span><strong>{formatCurrency(Number(form.monthlyIncome))}/mês</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Valor solicitado</span><strong>{formatCurrency(Number(form.requestedAmount))}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Parcelas</span><strong>{form.installments}x</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Comprovante de renda</span><strong>{form.hasIncomeProof === "sim" ? "Sim" : "Não"}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Restrição CPF</span><strong>{form.hasCreditRestriction === "nao" ? "Não" : form.hasCreditRestriction === "sim" ? "Sim" : "Não sabe"}</strong></div>
                </div>

                {(result === "baixo" || result === "medio") && Number(form.requestedAmount) > 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Estimativa de comissão</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Comissão oficina (4%)</span>
                        <span className="font-bold text-emerald-800">{formatCurrency(Number(form.requestedAmount) * 0.04)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Comissão AutoCred (2.5%)</span>
                        <span className="font-bold text-blue-800">{formatCurrency(Number(form.requestedAmount) * 0.025)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Aviso legal:</strong> Este resultado é uma simulação de triagem interna. Não representa aprovação de crédito. A análise definitiva será realizada por parceiro financeiro autorizado, sujeita a consulta de bureau de crédito e análise documental.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setForm(initialForm); }}>
                    Nova análise
                  </Button>
                  <Button className="flex-1" onClick={() => setTab("lista")}>
                    Ver solicitações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
