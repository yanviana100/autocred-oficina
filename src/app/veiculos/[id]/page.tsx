"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Gauge, Calendar, User, ClipboardList, FileText, DollarSign } from "lucide-react";
import { getSupabase, getWorkshopId } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Vehicle, ServiceOrder, Quote } from "@/types";

const statusLabel: Record<string, string> = {
  recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
  aguardando_peca: "Aguard. peça", finalizado: "Finalizado", entregue: "Entregue",
};
const statusColor: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700",
  em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700",
  finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700",
};

export default function VeiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();

      const [{ data: v }, { data: os }, { data: q }] = await Promise.all([
        supabase.from("vehicles").select("*, customers(name)").eq("id", id).single(),
        supabase.from("service_orders").select("*").eq("vehicle_id", id).eq("workshop_id", workshopId).order("created_at", { ascending: false }),
        supabase.from("quotes").select("*").eq("vehicle_id", id).eq("workshop_id", workshopId).order("created_at", { ascending: false }),
      ]);

      if (v) {
        setVehicle({ id: v.id, customerId: v.customer_id, brand: v.brand ?? "", model: v.model ?? "", year: v.year ?? 0, plate: v.plate ?? "", color: v.color, chassis: v.chassis, mileage: v.mileage ?? 0, notes: v.notes });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCustomerName((v as any).customers?.name ?? "");
      }
      setOrders((os ?? []).map((r) => ({
        id: r.id, osNumber: r.os_number ?? "", workshopId: r.workshop_id, quoteId: r.quote_id,
        customerId: r.customer_id, customerName: r.customer_name ?? "", vehicleId: r.vehicle_id,
        vehicleInfo: r.vehicle_info ?? "", serviceType: r.service_type ?? "",
        problemDescription: r.problem_description, technicianName: r.technician_name,
        status: r.status ?? "recebido", entryDate: r.entry_date ?? "",
        expectedDate: r.expected_date, completedDate: r.completed_date,
        totalValue: Number(r.total_value ?? 0), notes: r.notes,
        kmEntrada: r.km_entrada, kmSaida: r.km_saida,
        paymentStatus: r.payment_status ?? "pendente", paymentMethod: r.payment_method,
        paidAt: r.paid_at, isAvulsa: r.is_avulsa ?? false,
        createdAt: r.created_at?.split("T")[0] ?? "",
      })));
      setQuotes((q ?? []).map((r) => ({
        id: r.id, workshopId: r.workshop_id, customerId: r.customer_id, vehicleId: r.vehicle_id,
        customerName: r.customer_name ?? "", vehicleInfo: r.vehicle_info ?? "",
        serviceType: r.service_type ?? "", problemDescription: r.problem_description ?? "",
        items: [], laborCost: r.labor_cost ?? 0, totalValue: Number(r.total_value ?? 0),
        estimatedDays: r.estimated_days ?? 1, notes: r.notes,
        status: r.status ?? "rascunho", publicToken: r.public_token ?? "",
        createdAt: r.created_at?.split("T")[0] ?? "",
      })));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <DashboardLayout title="Carregando..." subtitle=""><div className="animate-pulse h-4 bg-slate-200 rounded w-48 mt-4" /></DashboardLayout>;
  if (!vehicle) return <DashboardLayout title="Veículo não encontrado" subtitle=""><Link href="/veiculos"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link></DashboardLayout>;

  const totalGasto = orders.filter((o) => o.paymentStatus === "pago").reduce((s, o) => s + o.totalValue, 0);
  const ultimaKm = orders.filter((o) => o.kmSaida != null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.kmSaida;

  return (
    <DashboardLayout title={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`} subtitle={`Placa ${vehicle.plate}`}>
      <Link href="/veiculos"><Button variant="ghost" size="sm" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Voltar</Button></Link>

      <div className="max-w-4xl space-y-6">
        {/* Card veículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Car className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-sm text-slate-500">{vehicle.plate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">Ano</p><p className="font-medium">{vehicle.year}</p></div>
                <div><p className="text-xs text-slate-400">Cor</p><p className="font-medium">{vehicle.color ?? "—"}</p></div>
                <div><p className="text-xs text-slate-400">KM atual</p><p className="font-medium">{(ultimaKm ?? vehicle.mileage).toLocaleString("pt-BR")} km</p></div>
                <div><p className="text-xs text-slate-400">Chassi</p><p className="font-medium text-xs">{vehicle.chassis ?? "—"}</p></div>
              </div>
              {vehicle.notes && <p className="text-xs text-slate-500 mt-3 pt-3 border-t">{vehicle.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Proprietário</span><span className="font-semibold ml-auto">{customerName}</span></div>
              <div className="flex items-center gap-2 text-sm"><ClipboardList className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Total de OS</span><span className="font-semibold ml-auto">{orders.length}</span></div>
              <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Orçamentos</span><span className="font-semibold ml-auto">{quotes.length}</span></div>
              <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Total investido</span><span className="font-semibold ml-auto text-emerald-600">{formatCurrency(totalGasto)}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de OS */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4" />Histórico de Ordens de Serviço</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhuma OS registrada para este veículo.</p>
            ) : orders.map((o) => (
              <div key={o.id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{o.osNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] ?? ""}`}>{statusLabel[o.status] ?? o.status}</span>
                    {o.paymentStatus === "pago" && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Pago</span>}
                  </div>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{o.serviceType}</p>
                  {o.problemDescription && <p className="text-xs text-slate-500">{o.problemDescription}</p>}
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(o.entryDate)}</span>
                    {o.technicianName && <span>Técnico: {o.technicianName}</span>}
                    {o.kmEntrada != null && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{o.kmEntrada.toLocaleString("pt-BR")} → {o.kmSaida != null ? o.kmSaida.toLocaleString("pt-BR") : "?"} km</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">{formatCurrency(o.totalValue)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Histórico de orçamentos */}
        {quotes.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Orçamentos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {quotes.map((q) => (
                <Link key={q.id} href={`/orcamentos/${q.id}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{q.serviceType}</p>
                    <p className="text-xs text-slate-500">{formatDate(q.createdAt)} · {q.status}</p>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(q.totalValue)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
