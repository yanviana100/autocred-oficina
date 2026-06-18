"use client";
import { use } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Car, FileText, ArrowLeft, Phone, Mail, MapPin, ClipboardList } from "lucide-react";
import { useCustomers, useVehicles, useQuotes, useServiceOrders } from "@/hooks/useStore";
import { formatDate, formatCurrency, quoteStatusLabel, quoteStatusColor } from "@/lib/utils";

const osStatusLabel: Record<string, string> = {
  recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
  aguardando_peca: "Ag. peça", finalizado: "Finalizado", entregue: "Entregue",
};
const osStatusColor: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700",
  em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700",
  finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700",
};

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { get: getCustomer } = useCustomers();
  const { byCustomer: vehiclesByCustomer } = useVehicles();
  const { byCustomer: quotesByCustomer } = useQuotes();
  const { byCustomer: ordersByCustomer } = useServiceOrders();

  const customer = getCustomer(id);
  const vehicles = vehiclesByCustomer(id);
  const quotes   = quotesByCustomer(id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const orders   = ordersByCustomer(id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!customer) {
    return (
      <DashboardLayout title="Cliente não encontrado" subtitle="">
        <p className="text-slate-500">Este cliente não existe ou foi removido.</p>
        <Link href="/clientes"><Button className="mt-4 gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button></Link>
      </DashboardLayout>
    );
  }

  const totalGasto = quotes.filter((q) => q.status === "concluido").reduce((s, q) => s + q.totalValue, 0);

  return (
    <DashboardLayout title={customer.name} subtitle={`Histórico completo · cadastrado em ${formatDate(customer.createdAt)}`}>
      <div className="mb-6">
        <Link href="/clientes"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</Button></Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dados do cliente */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div>
                <div><h3 className="font-bold text-slate-900">{customer.name}</h3><p className="text-xs text-slate-500">{customer.cpf}</p></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" />{customer.whatsapp}</div>
                {customer.email && <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" />{customer.email}</div>}
                <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400" />{customer.city}, {customer.state}</div>
                {customer.address && <p className="text-xs text-slate-400 pl-5">{customer.address}</p>}
              </div>
            </CardContent>
          </Card>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Veículos", value: vehicles.length, color: "text-blue-600" },
              { label: "Orçamentos", value: quotes.length, color: "text-violet-600" },
              { label: "OS", value: orders.length, color: "text-emerald-600" },
            ].map((k) => (
              <Card key={k.label}><CardContent className="p-3 text-center"><p className={`text-xl font-bold ${k.color}`}>{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></CardContent></Card>
            ))}
          </div>

          {totalGasto > 0 && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-1">Total gasto</p>
                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(totalGasto)}</p>
                <p className="text-xs text-emerald-600 mt-0.5">em serviços concluídos</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Veículos */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
              <Car className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum veículo cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{v.brand} {v.model} {v.year}</p>
                        <p className="text-xs text-slate-500">Placa: {v.plate} · {v.mileage.toLocaleString("pt-BR")} km {v.color ? `· ${v.color}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orçamentos */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
              <FileText className="w-4 h-4 text-violet-600" />
              <CardTitle className="text-sm">Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum orçamento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b"><tr className="text-left text-xs text-slate-400">
                      <th className="pb-2">Serviço</th><th className="pb-2">Valor</th><th className="pb-2">Status</th><th className="pb-2">Data</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {quotes.map((q) => (
                        <tr key={q.id}>
                          <td className="py-2 pr-3 font-medium">{q.serviceType}</td>
                          <td className="py-2 pr-3">{formatCurrency(q.totalValue)}</td>
                          <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quoteStatusColor[q.status]}`}>{quoteStatusLabel[q.status]}</span></td>
                          <td className="py-2 text-slate-500 text-xs">{formatDate(q.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ordens de serviço */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center gap-2 space-y-0">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm">Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma OS gerada.</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{o.osNumber} — {o.serviceType}</p>
                        <p className="text-xs text-slate-500">{o.vehicleInfo} · Entrada: {formatDate(o.entryDate)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${osStatusColor[o.status]}`}>{osStatusLabel[o.status]}</span>
                        <p className="text-xs text-slate-500 mt-1">{formatCurrency(o.totalValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
