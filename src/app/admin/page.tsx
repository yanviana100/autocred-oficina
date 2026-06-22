"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, ClipboardList, FileText, Search,
  ShieldOff, Shield, TrendingUp, RefreshCw, AlertTriangle,
} from "lucide-react";
import { getSupabase } from "@/lib/db";
import { formatDate, formatCurrency, planLabel, planColor } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface WorkshopRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  suspended_at: string | null;
  onboarding_completed: boolean;
  trial_ends_at: string | null;
  created_at: string;
  customer_count: number;
  os_count: number;
  os_this_month: number;
  quote_count: number;
}

interface AdminData {
  total_workshops: number;
  active_workshops: number;
  total_os: number;
  os_this_month: number;
  total_customers: number;
  total_quotes: number;
  workshops: WorkshopRow[];
}

const PLAN_PRICE: Record<string, number> = { starter: 150, pro: 250, premium: 399 };

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; type: "suspend" | "reactivate" | "plan"; plan?: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data: result, error } = await supabase.rpc("get_admin_data");
    if (error) {
      if (error.message.includes("Unauthorized")) { setUnauthorized(true); }
      setLoading(false);
      return;
    }
    setData(result as AdminData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (workshopId: string, suspend: boolean) => {
    setActionLoading(workshopId);
    const supabase = getSupabase();
    const { error } = await supabase.rpc("admin_toggle_suspend", { p_workshop_id: workshopId, p_suspend: suspend });
    if (error) { toast("Erro ao atualizar.", "error"); }
    else { toast(suspend ? "Oficina suspensa." : "Acesso reativado!"); await load(); }
    setActionLoading(null);
    setConfirmAction(null);
  };

  const handleChangePlan = async (workshopId: string, plan: string) => {
    setActionLoading(workshopId);
    const supabase = getSupabase();
    const { error } = await supabase.rpc("admin_change_plan", { p_workshop_id: workshopId, p_plan: plan });
    if (error) { toast("Erro ao alterar plano.", "error"); }
    else { toast("Plano alterado!"); await load(); }
    setActionLoading(null);
    setConfirmAction(null);
  };

  if (unauthorized) {
    return (
      <DashboardLayout title="Admin" subtitle="">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ShieldOff className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold text-slate-900">Acesso negado</h2>
          <p className="text-slate-500 text-sm">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => router.push("/dashboard")}>Voltar ao dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const workshops = data?.workshops ?? [];
  const filtered = workshops.filter((w) => {
    const matchSearch = !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "todos" || w.plan === planFilter;
    const matchStatus = statusFilter === "todos" ||
      (statusFilter === "ativo" && !w.suspended_at && w.onboarding_completed) ||
      (statusFilter === "suspenso" && !!w.suspended_at) ||
      (statusFilter === "pendente" && !w.onboarding_completed);
    return matchSearch && matchPlan && matchStatus;
  });

  const mrr = workshops
    .filter((w) => !w.suspended_at)
    .reduce((sum, w) => sum + (PLAN_PRICE[w.plan] ?? 0), 0);

  return (
    <DashboardLayout title="Admin" subtitle="Painel de administração da plataforma">
      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Confirmar ação</h3>
            </div>
            {confirmAction.type === "suspend" && (
              <p className="text-sm text-slate-500 mb-6">Suspender acesso de <strong>{confirmAction.name}</strong>? A oficina não conseguirá mais fazer login.</p>
            )}
            {confirmAction.type === "reactivate" && (
              <p className="text-sm text-slate-500 mb-6">Reativar acesso de <strong>{confirmAction.name}</strong>?</p>
            )}
            {confirmAction.type === "plan" && (
              <p className="text-sm text-slate-500 mb-6">Alterar plano de <strong>{confirmAction.name}</strong> para <strong>{planLabel[confirmAction.plan ?? ""] ?? confirmAction.plan}</strong>?</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button
                className={`flex-1 ${confirmAction.type === "suspend" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                disabled={!!actionLoading}
                onClick={() => {
                  if (confirmAction.type === "suspend") handleSuspend(confirmAction.id, true);
                  else if (confirmAction.type === "reactivate") handleSuspend(confirmAction.id, false);
                  else if (confirmAction.type === "plan") handleChangePlan(confirmAction.id, confirmAction.plan!);
                }}
              >
                {actionLoading ? "Aguarde..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Oficinas ativas", value: loading ? "—" : data?.active_workshops ?? 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "MRR", value: loading ? "—" : formatCurrency(mrr), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "OS este mês", value: loading ? "—" : data?.os_this_month ?? 0, icon: ClipboardList, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Total clientes", value: loading ? "—" : data?.total_customers ?? 0, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.bg}`}>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className="text-xl font-bold text-slate-900">{String(k.value)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Oficinas ({filtered.length})
              </CardTitle>
              <button onClick={load} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-8 text-sm border border-slate-200 rounded-lg px-3 bg-white">
                <option value="todos">Todos os planos</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 text-sm border border-slate-200 rounded-lg px-3 bg-white">
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="pendente">Onboarding pendente</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma oficina encontrada.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr className="text-left text-xs text-slate-500">
                      <th className="px-4 py-3 font-semibold">Oficina</th>
                      <th className="px-4 py-3 font-semibold">Plano</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-center">Clientes</th>
                      <th className="px-4 py-3 font-semibold text-center">OS mês</th>
                      <th className="px-4 py-3 font-semibold text-center">OS total</th>
                      <th className="px-4 py-3 font-semibold">Cadastro</th>
                      <th className="px-4 py-3 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((w) => {
                      const isSuspended = !!w.suspended_at;
                      const isPending = !w.onboarding_completed;
                      return (
                        <tr key={w.id} className={`hover:bg-slate-50 ${isSuspended ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{w.name}</p>
                            <p className="text-xs text-slate-400">{w.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={w.plan}
                              disabled={!!actionLoading}
                              onChange={(e) => setConfirmAction({ id: w.id, name: w.name, type: "plan", plan: e.target.value })}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${planColor[w.plan] ?? "bg-slate-100 text-slate-700"}`}
                            >
                              <option value="starter">Starter</option>
                              <option value="pro">Pro</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspenso</span>
                            ) : isPending ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Onboarding</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Ativo</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">{w.customer_count}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${w.os_this_month > 0 ? "text-blue-600" : "text-slate-400"}`}>{w.os_this_month}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500">{w.os_count}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{formatDate(w.created_at)}</td>
                          <td className="px-4 py-3">
                            {isSuspended ? (
                              <button
                                onClick={() => setConfirmAction({ id: w.id, name: w.name, type: "reactivate" })}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <Shield className="w-3.5 h-3.5" /> Reativar
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmAction({ id: w.id, name: w.name, type: "suspend" })}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                              >
                                <ShieldOff className="w-3.5 h-3.5" /> Suspender
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totais extras */}
        {data && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total de OS na plataforma", value: data.total_os, icon: ClipboardList },
              { label: "Total de orçamentos", value: data.total_quotes, icon: FileText },
              { label: "Total de oficinas cadastradas", value: data.total_workshops, icon: Building2 },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <k.icon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-lg font-bold text-slate-900">{k.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
