"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle, DollarSign, TrendingUp, Zap,
  Users, Car, FileText, ClipboardList, ArrowRight, UserX, MessageCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics, useQuotes, useServiceOrders } from "@/hooks/useStore";
import { formatCurrency, formatDate, quoteStatusColor, quoteStatusLabel } from "@/lib/utils";
import { getSupabase, getWorkshopId } from "@/lib/db";

type KpiColor = "blue" | "green" | "violet" | "amber" | "slate" | "emerald" | "indigo" | "orange";
const colorMap: Record<KpiColor, string> = {
  blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600",
  violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600", emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600", orange: "bg-orange-50 text-orange-600",
};

const planLabel: Record<string, string> = { starter: "Starter", pro: "Pro", premium: "Premium" };
const planPrice: Record<string, string> = { starter: "R$150/mês", pro: "R$250/mês", premium: "R$399/mês" };
const planColor: Record<string, string> = { starter: "bg-slate-100 text-slate-600", pro: "bg-blue-50 text-blue-600", premium: "bg-amber-50 text-amber-600" };

function Kpi({ title, value, sub, icon: Icon, color }: {
  title: string; value: string; sub: string; icon: typeof Users; color: KpiColor;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Onboarding checklist
function OnboardingChecklist({ hasCustomers, hasVehicles, hasQuotes, hasOrders, hasProfile }: {
  hasCustomers: boolean; hasVehicles: boolean; hasQuotes: boolean; hasOrders: boolean; hasProfile: boolean;
}) {
  const steps = [hasCustomers, hasVehicles, hasOrders, hasQuotes, hasProfile];
  const done = steps.filter(Boolean).length;
  const total = steps.length;
  if (done === total) return null;
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-blue-900">Configure sua oficina ({done}/{total})</p>
          <span className="text-xs text-blue-600 font-medium">{Math.round((done / total) * 100)}% concluído</span>
        </div>
        <div className="w-full h-1.5 bg-blue-200 rounded-full mb-4">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ChecklistItem done={hasCustomers} label="Cadastre seu primeiro cliente" href="/clientes" />
          <ChecklistItem done={hasVehicles} label="Adicione um veículo" href="/veiculos" />
          <ChecklistItem done={hasOrders} label="Crie uma ordem de serviço" href="/ordens/nova" />
          <ChecklistItem done={hasQuotes} label="Envie seu primeiro orçamento" href="/orcamentos/novo" />
          <ChecklistItem done={hasProfile} label="Complete o perfil da oficina" href="/perfil" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistItem({ done, label, href }: { done: boolean; label: string; href: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500" : "border-2 border-blue-300"}`}>
        {done && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      {done ? (
        <span className="text-sm text-slate-500 line-through">{label}</span>
      ) : (
        <Link href={href} className="text-sm text-blue-700 font-medium hover:underline flex items-center gap-1">
          {label} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

interface InactiveCustomer {
  id: string;
  name: string;
  phone: string;
  last_os: string;
}

function InactiveCustomersCard({ customers }: { customers: InactiveCustomer[] }) {
  if (customers.length === 0) return null;
  const preview = customers.slice(0, 3);
  const rest = customers.length - 3;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <UserX className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {customers.length} cliente{customers.length > 1 ? "s" : ""} sem retorno há 60+ dias
              </p>
              <p className="text-xs text-amber-600">Entre em contato e recupere essa receita</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {preview.map((c) => {
            const msg = encodeURIComponent(`Olá ${c.name.split(" ")[0]}! Tudo bem? Faz um tempo que não te vemos aqui na oficina. Seu carro está precisando de revisão? Estamos à disposição! 😊`);
            const phone = c.phone?.replace(/\D/g, "");
            const waUrl = phone ? `https://wa.me/55${phone}?text=${msg}` : null;
            return (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">Última OS: {new Date(c.last_os).toLocaleDateString("pt-BR")}</p>
                </div>
                {waUrl ? (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                ) : (
                  <Link href={`/clientes/${c.id}`}
                    className="text-xs text-blue-600 hover:underline font-medium">Ver cliente</Link>
                )}
              </div>
            );
          })}
          {rest > 0 && (
            <p className="text-xs text-amber-600 text-center pt-1">+{rest} outros clientes inativos</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const metrics = useDashboardMetrics();
  const { quotes } = useQuotes();
  const { orders } = useServiceOrders();
  const [plan, setPlan] = useState("starter");
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomer[]>([]);

  useEffect(() => {
    async function loadPlan() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("workshops").select("plan, trial_ends_at").eq("id", workshopId).single();
      if (data) {
        setPlan(data.plan ?? "starter");
        if (data.trial_ends_at) {
          const days = Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86400000);
          setTrialDaysLeft(Math.max(0, days));
        }
      }
    }

    async function loadInactive() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();
      const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      // Busca OS agrupadas por customer — pega o último por cliente
      const { data: osData } = await supabase
        .from("service_orders")
        .select("customer_id, created_at")
        .eq("workshop_id", workshopId)
        .order("created_at", { ascending: false });

      if (!osData) return;

      // Última OS por cliente
      const lastOsByCustomer: Record<string, string> = {};
      for (const row of osData) {
        if (!lastOsByCustomer[row.customer_id]) {
          lastOsByCustomer[row.customer_id] = row.created_at;
        }
      }

      // Filtra clientes sem OS nos últimos 60 dias
      const inactiveIds = Object.entries(lastOsByCustomer)
        .filter(([, date]) => date < cutoff)
        .map(([id]) => id)
        .slice(0, 10);

      if (inactiveIds.length === 0) return;

      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, phone")
        .in("id", inactiveIds);

      if (!customers) return;

      setInactiveCustomers(
        customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          last_os: lastOsByCustomer[c.id],
        })).sort((a, b) => a.last_os.localeCompare(b.last_os))
      );
    }

    loadPlan();
    loadInactive();
  }, []);

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrders = [...orders]
    .filter((o) => !["finalizado", "entregue"].includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const osStatusLabel: Record<string, string> = {
    recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
    aguardando_peca: "Ag. peça", finalizado: "Finalizado", entregue: "Entregue",
  };
  const osStatusColor: Record<string, string> = {
    recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700",
    em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700",
    finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700",
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Visão geral da sua oficina">

      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft <= 14 && (
        <div className={`mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${trialDaysLeft <= 3 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
          <p className={`text-sm font-medium ${trialDaysLeft <= 3 ? "text-red-700" : "text-amber-700"}`}>
            {trialDaysLeft === 0 ? "Seu período de teste expirou." : `Seu período de teste termina em ${trialDaysLeft} dia(s).`}
          </p>
          <Link href="/billing">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">Ver planos</Button>
          </Link>
        </div>
      )}

      {/* Clientes inativos */}
      {inactiveCustomers.length > 0 && (
        <div className="mb-4">
          <InactiveCustomersCard customers={inactiveCustomers} />
        </div>
      )}

      {/* Onboarding checklist */}
      <div className="mb-4">
        <OnboardingChecklist
          hasCustomers={metrics.totalCustomers > 0}
          hasVehicles={metrics.totalVehicles > 0}
          hasQuotes={quotes.length > 0}
          hasOrders={orders.length > 0}
          hasProfile={!!metrics.totalCustomers}
        />
      </div>

      {/* KPI ROW 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Clientes cadastrados" value={String(metrics.totalCustomers)} sub="total na base" icon={Users} color="blue" />
        <Kpi title="Veículos" value={String(metrics.totalVehicles)} sub="cadastrados" icon={Car} color="violet" />
        <Kpi title="Orçamentos no mês" value={String(metrics.quotesThisMonth)} sub="mês atual" icon={FileText} color="amber" />
        <Kpi title="Ticket médio" value={metrics.avgTicket > 0 ? formatCurrency(metrics.avgTicket) : "—"} sub="orçamentos aprovados" icon={TrendingUp} color="green" />
      </div>

      {/* KPI ROW 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Kpi title="OS em aberto" value={String(metrics.openOrders)} sub="em execução" icon={ClipboardList} color="orange" />
        <Kpi title="OS concluídas" value={String(metrics.completedOrders)} sub="finalizadas/entregues" icon={CheckCircle} color="emerald" />
        <Kpi title="Receita gerada" value={metrics.revenueGenerated > 0 ? formatCurrency(metrics.revenueGenerated) : "—"} sub="OS concluídas" icon={DollarSign} color="indigo" />
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">Plano ativo</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{planLabel[plan] ?? plan}</p>
                <p className="text-xs text-slate-400 mt-0.5">{planPrice[plan] ?? ""}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${planColor[plan] ?? colorMap.slate}`}>
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <Link href="/billing">
              <p className="text-xs text-blue-600 hover:underline mt-2">Ver planos →</p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* RECENT QUOTES + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Orçamentos recentes</CardTitle>
            <Link href="/orcamentos"><Button variant="ghost" size="sm" className="text-blue-600 text-xs">Ver todos</Button></Link>
          </CardHeader>
          <CardContent>
            {recentQuotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum orçamento ainda.</p>
                <Link href="/orcamentos/novo">
                  <Button size="sm" className="mt-3 gap-1"><FileText className="w-3 h-3" /> Criar orçamento</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Serviço</th>
                    <th className="py-2 pr-3">Valor</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Data</th>
                  </tr></thead>
                  <tbody>
                    {recentQuotes.map((q) => (
                      <tr key={q.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer">
                        <td className="py-2.5 pr-3 font-medium">{q.customerName}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{q.serviceType}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatCurrency(q.totalValue)}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${quoteStatusColor[q.status]}`}>
                            {quoteStatusLabel[q.status]}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-500 text-xs">{formatDate(q.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/orcamentos/novo" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><FileText className="w-4 h-4" /> Novo Orçamento</Button>
            </Link>
            <Link href="/clientes" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><Users className="w-4 h-4" /> Clientes</Button>
            </Link>
            <Link href="/ordens" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><ClipboardList className="w-4 h-4" /> Ordens de Serviço</Button>
            </Link>
            <Link href="/relatorios" className="block">
              <Button variant="outline" className="w-full justify-start gap-2"><TrendingUp className="w-4 h-4" /> Relatórios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* OS em andamento */}
      {recentOrders.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">OS em andamento</CardTitle>
            <Link href="/ordens"><Button variant="ghost" size="sm" className="text-blue-600 text-xs">Ver todas</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-semibold text-sm">{o.osNumber} — {o.serviceType}</p>
                    <p className="text-xs text-slate-500">{o.customerName} · {o.vehicleInfo}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${osStatusColor[o.status] ?? ""}`}>
                      {osStatusLabel[o.status] ?? o.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(o.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
