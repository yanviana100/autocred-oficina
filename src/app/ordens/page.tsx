"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ClipboardList, ChevronDown } from "lucide-react";
import { useServiceOrders } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ServiceOrderStatus } from "@/types";

const statusLabel: Record<ServiceOrderStatus, string> = {
  recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
  aguardando_peca: "Aguardando peça", finalizado: "Finalizado", entregue: "Entregue",
};
const statusColor: Record<ServiceOrderStatus, string> = {
  recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700",
  em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700",
  finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700",
};
const allStatuses: ServiceOrderStatus[] = ["recebido","em_analise","em_execucao","aguardando_peca","finalizado","entregue"];
const nextStatus: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  recebido: "em_analise", em_analise: "em_execucao", em_execucao: "finalizado",
  aguardando_peca: "em_execucao", finalizado: "entregue",
};

export default function OrdensPage() {
  const { orders, updateStatus, update } = useServiceOrders();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ServiceOrderStatus | "todas">("todas");

  const filtered = orders
    .filter((o) => filterStatus === "todas" || o.status === filterStatus)
    .filter((o) =>
      o.osNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceType.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const advance = (id: string, current: ServiceOrderStatus) => {
    const next = nextStatus[current];
    if (!next) return;
    updateStatus(id, next);
    toast(`OS atualizada para: ${statusLabel[next]}`);
  };

  const totals = Object.fromEntries(
    allStatuses.map((s) => [s, orders.filter((o) => o.status === s).length])
  );

  return (
    <DashboardLayout title="Ordens de Serviço" subtitle={`${orders.length} ordens geradas`}>
      {/* Resumo por status */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "todas" : s)}
            className={`rounded-xl border p-3 text-center transition-all ${filterStatus === s ? "ring-2 ring-blue-500" : "hover:shadow-sm"}`}
          >
            <p className="text-xl font-bold text-slate-900">{totals[s] ?? 0}</p>
            <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${statusColor[s]}`}>{statusLabel[s]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por OS, cliente ou serviço..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ServiceOrderStatus | "todas")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os status</SelectItem>
            {allStatuses.map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhuma OS encontrada.</p>
          <p className="text-xs text-slate-400 mt-1">As ordens de serviço são criadas automaticamente quando um orçamento é aprovado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const canAdvance = !!nextStatus[o.status];
            return (
              <Card key={o.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{o.osNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">{o.serviceType}</p>
                      <p className="text-xs text-slate-500">{o.customerName} · {o.vehicleInfo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(o.totalValue)}</p>
                      <p className="text-xs text-slate-400">Entrada: {formatDate(o.entryDate)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                    {o.technicianName && (
                      <span className="text-xs text-slate-500">Técnico: <strong>{o.technicianName}</strong></span>
                    )}
                    {o.expectedDate && (
                      <span className="text-xs text-slate-500">Previsão: <strong>{formatDate(o.expectedDate)}</strong></span>
                    )}
                    <div className="ml-auto flex gap-2">
                      {/* Atribuir técnico */}
                      <TechnicianInput osId={o.id} current={o.technicianName} onSave={(name) => { update(o.id, { technicianName: name }); toast("Técnico atribuído!"); }} />
                      {canAdvance && (
                        <Button size="sm" className="gap-1" onClick={() => advance(o.id, o.status)}>
                          <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" /> Avançar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

function TechnicianInput({ osId, current, onSave }: { osId: string; current?: string; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current ?? "");
  if (!editing) return (
    <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">
      {current ? `Técnico: ${current}` : "Atribuir técnico"}
    </button>
  );
  return (
    <div className="flex gap-1">
      <Input className="h-7 text-xs w-36" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Nome do técnico" autoFocus />
      <Button size="sm" className="h-7 text-xs" onClick={() => { onSave(val); setEditing(false); }}>OK</Button>
    </div>
  );
}
