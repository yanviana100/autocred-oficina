"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, Car, ClipboardList, FileText, ShieldOff, Shield, Phone, Mail, MapPin } from "lucide-react";
import { getSupabase } from "@/lib/db";
import { formatDate, formatCurrency, planLabel, planColor } from "@/lib/utils";

interface WorkshopDetail {
  workshop: {
    id: string; name: string; email: string; phone: string; address: string;
    plan: string; onboarding_completed: boolean; suspended_at: string | null;
    trial_ends_at: string | null; created_at: string;
  };
  customers: { id: string; name: string; phone: string; email: string; cpf: string; created_at: string }[];
  vehicles: { id: string; plate: string; brand: string; model: string; year: number; mileage: number; color: string; created_at: string }[];
  service_orders: { id: string; number: string; status: string; total: number; created_at: string }[];
  quotes: { id: string; number: string; status: string; total: number; created_at: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  open: "Aberta", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada",
  draft: "Rascunho", sent: "Enviado", approved: "Aprovado", rejected: "Recusado",
};
const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-100 text-blue-700", in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-600", sent: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700",
};

export default function OficinaDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<WorkshopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [tab, setTab] = useState<"clientes" | "veiculos" | "os" | "orcamentos">("os");

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const { data: result, error } = await supabase.rpc("get_workshop_detail", { p_workshop_id: id });
    if (error) {
      if (error.message.includes("Unauthorized")) setUnauthorized(true);
      setLoading(false);
      return;
    }
    setData(result as WorkshopDetail);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (unauthorized) {
    return (
      <DashboardLayout title="Suporte" subtitle="">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ShieldOff className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold">Acesso negado</h2>
          <Button onClick={() => router.push("/admin")}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Suporte" subtitle="">
        <div className="p-12 text-center text-slate-400">Carregando...</div>
      </DashboardLayout>
    );
  }

  if (!data) return null;
  const { workshop, customers, vehicles, service_orders, quotes } = data;
  const isSuspended = !!workshop.suspended_at;

  return (
    <DashboardLayout
      title="Modo suporte"
      subtitle={`Visualizando dados de ${workshop.name}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{workshop.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(planColor as Record<string, string>)[workshop.plan] ?? "bg-slate-100 text-slate-700"}`}>
                {(planLabel as Record<string, string>)[workshop.plan] ?? workshop.plan}
              </span>
              {isSuspended ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspenso</span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Ativo</span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Cadastro em {formatDate(workshop.created_at)}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contato</p>
              {workshop.email && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" /> {workshop.email}
                </div>
              )}
              {workshop.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" /> {workshop.phone}
                </div>
              )}
              {workshop.address && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" /> {workshop.address}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Clientes", value: customers.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Veículos", value: vehicles.length, icon: Car, color: "text-violet-600", bg: "bg-violet-50" },
              { label: "OS", value: service_orders.length, icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Orçamentos", value: quotes.length, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="p-3 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-lg font-bold text-slate-900">{k.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex gap-1 border-b border-slate-100 -mx-6 px-6">
              {([
                { key: "os", label: "Ordens de Serviço", count: service_orders.length },
                { key: "orcamentos", label: "Orçamentos", count: quotes.length },
                { key: "clientes", label: "Clientes", count: customers.length },
                { key: "veiculos", label: "Veículos", count: vehicles.length },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label} <span className="ml-1 text-xs text-slate-400">({t.count})</span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* OS */}
            {tab === "os" && (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-semibold">Número</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {service_orders.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhuma OS encontrada.</td></tr>
                  ) : service_orders.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700">#{s.number}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[s.status] ?? "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[s.status] ?? s.status}</span></td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(s.total)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Orçamentos */}
            {tab === "orcamentos" && (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-semibold">Número</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum orçamento encontrado.</td></tr>
                  ) : quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700">#{q.number}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[q.status] ?? "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[q.status] ?? q.status}</span></td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(q.total)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(q.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Clientes */}
            {tab === "clientes" && (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="px-4 py-3 font-semibold">E-mail</th>
                    <th className="px-4 py-3 font-semibold">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
                  ) : customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{c.email || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Veículos */}
            {tab === "veiculos" && (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-semibold">Placa</th>
                    <th className="px-4 py-3 font-semibold">Veículo</th>
                    <th className="px-4 py-3 font-semibold">Ano</th>
                    <th className="px-4 py-3 font-semibold">KM</th>
                    <th className="px-4 py-3 font-semibold">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum veículo encontrado.</td></tr>
                  ) : vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.plate}</td>
                      <td className="px-4 py-3 text-slate-700">{v.brand} {v.model}</td>
                      <td className="px-4 py-3 text-slate-500">{v.year || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{v.mileage ? `${v.mileage.toLocaleString("pt-BR")} km` : "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
