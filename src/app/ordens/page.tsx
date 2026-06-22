"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ClipboardList, ChevronRight, Plus, X, DollarSign, Gauge, Printer } from "lucide-react";
import { useServiceOrders, useCustomers, useVehicles, useTechnicians } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ServiceOrderStatus, PaymentMethod } from "@/types";
import Link from "next/link";

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
const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro", pix: "Pix", cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito", boleto: "Boleto", cheque: "Cheque",
};
const serviceTypes = ["Motor","Câmbio","Suspensão","Freios","Elétrica","Ar-condicionado","Funilaria","Pintura","Revisão","Alinhamento e Balanceamento","Escapamento","Outro"];

export default function OrdensPage() {
  const router = useRouter();
  const { orders, updateStatus, update, markAsPaid, createAvulsa } = useServiceOrders();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { technicians } = useTechnicians();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ServiceOrderStatus | "todas">("todas");
  const [showAvulsa, setShowAvulsa] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("pix");
  const [editingKm, setEditingKm] = useState<{ id: string; field: "entrada" | "saida"; val: string } | null>(null);

  // Form OS avulsa
  const [avulsa, setAvulsa] = useState({
    customerId: "", vehicleId: "", serviceType: "", problemDescription: "",
    technicianName: "", totalValue: "", kmEntrada: "", expectedDate: "", notes: "",
  });
  const [savingAvulsa, setSavingAvulsa] = useState(false);

  const updateAvulsa = (k: string, v: string) => setAvulsa((f) => ({ ...f, [k]: v }));
  const availableVehicles = vehicles.filter((v) => v.customerId === avulsa.customerId);

  const filtered = orders
    .filter((o) => filterStatus === "todas" || o.status === filterStatus)
    .filter((o) =>
      o.osNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicleInfo.toLowerCase().includes(search.toLowerCase())
    );

  const advance = async (id: string, current: ServiceOrderStatus) => {
    const next = nextStatus[current];
    if (!next) return;
    await updateStatus(id, next);
    toast(`OS → ${statusLabel[next]}`);
  };

  const handlePay = async () => {
    if (!payingId) return;
    await markAsPaid(payingId, payMethod);
    setPayingId(null);
    toast("Pagamento registrado!");
  };

  const handleSaveKm = async () => {
    if (!editingKm) return;
    const val = Number(editingKm.val);
    if (isNaN(val) || val < 0) { toast("KM inválido.", "warning"); return; }
    await update(editingKm.id, editingKm.field === "entrada" ? { kmEntrada: val } : { kmSaida: val });
    setEditingKm(null);
    toast("KM salvo!");
  };

  const handleCreateAvulsa = async () => {
    if (!avulsa.customerId || !avulsa.vehicleId || !avulsa.serviceType || !avulsa.problemDescription) {
      toast("Preencha cliente, veículo, serviço e descrição.", "warning");
      return;
    }
    if (!avulsa.totalValue || Number(avulsa.totalValue) <= 0) {
      toast("Informe o valor total do serviço.", "warning");
      return;
    }
    setSavingAvulsa(true);
    const customer = customers.find((c) => c.id === avulsa.customerId);
    const vehicle = vehicles.find((v) => v.id === avulsa.vehicleId);
    const newOs = await createAvulsa({
      customerId: avulsa.customerId,
      customerName: customer?.name ?? "",
      vehicleId: avulsa.vehicleId,
      vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.plate}` : "",
      serviceType: avulsa.serviceType,
      problemDescription: avulsa.problemDescription,
      technicianName: avulsa.technicianName || undefined,
      totalValue: Number(avulsa.totalValue),
      kmEntrada: avulsa.kmEntrada ? Number(avulsa.kmEntrada) : undefined,
      expectedDate: avulsa.expectedDate || undefined,
      notes: avulsa.notes || undefined,
    });
    setSavingAvulsa(false);
    setShowAvulsa(false);
    setAvulsa({ customerId: "", vehicleId: "", serviceType: "", problemDescription: "", technicianName: "", totalValue: "", kmEntrada: "", expectedDate: "", notes: "" });
    toast("OS criada com sucesso!");
    if (newOs?.id) router.push(`/ordens/${newOs.id}`);
  };

  const totals = Object.fromEntries(
    allStatuses.map((s) => [s, orders.filter((o) => o.status === s).length])
  );
  const totalPendente = orders.filter((o) => o.paymentStatus === "pendente" && ["finalizado","entregue"].includes(o.status)).reduce((s, o) => s + o.totalValue, 0);

  return (
    <DashboardLayout title="Ordens de Serviço" subtitle={`${orders.length} ordens geradas`}>

      {/* Modal OS avulsa */}
      {showAvulsa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Nova OS Avulsa</h2>
              <button onClick={() => setShowAvulsa(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Cliente *</Label>
                  <Select value={avulsa.customerId} onValueChange={(v) => updateAvulsa("customerId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Veículo *</Label>
                  <Select value={avulsa.vehicleId} onValueChange={(v) => updateAvulsa("vehicleId", v)} disabled={!avulsa.customerId}>
                    <SelectTrigger><SelectValue placeholder={avulsa.customerId ? "Selecione o veículo" : "Primeiro selecione o cliente"} /></SelectTrigger>
                    <SelectContent>{availableVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year} — {v.plate}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Tipo de Serviço *</Label>
                  <Select value={avulsa.serviceType} onValueChange={(v) => updateAvulsa("serviceType", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{serviceTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Descrição do serviço *</Label>
                  <Textarea rows={2} placeholder="Descreva o serviço a ser realizado..." value={avulsa.problemDescription} onChange={(e) => updateAvulsa("problemDescription", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Valor total (R$) *</Label>
                  <Input type="number" min={0} step={0.01} placeholder="0,00" value={avulsa.totalValue} onChange={(e) => updateAvulsa("totalValue", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>KM de entrada</Label>
                  <Input type="number" min={0} placeholder="Ex: 45000" value={avulsa.kmEntrada} onChange={(e) => updateAvulsa("kmEntrada", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Técnico</Label>
                  <Select value={avulsa.technicianName} onValueChange={(v) => updateAvulsa("technicianName", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecionar técnico" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não atribuído</SelectItem>
                      {technicians.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Previsão de entrega</Label>
                  <Input type="date" value={avulsa.expectedDate} onChange={(e) => updateAvulsa("expectedDate", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Observações</Label>
                  <Input placeholder="Observações internas..." value={avulsa.notes} onChange={(e) => updateAvulsa("notes", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowAvulsa(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreateAvulsa} disabled={savingAvulsa}>
                {savingAvulsa ? "Criando..." : "Criar OS"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dar baixa pagamento */}
      {payingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-4">Registrar pagamento</h3>
            <div className="space-y-3">
              <Label>Forma de pagamento</Label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setPayingId(null)}>Cancelar</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handlePay}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal KM */}
      {editingKm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6">
            <h3 className="font-semibold mb-4">KM de {editingKm.field === "entrada" ? "entrada" : "saída"}</h3>
            <Input type="number" min={0} value={editingKm.val} onChange={(e) => setEditingKm((p) => p ? { ...p, val: e.target.value } : p)} autoFocus />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditingKm(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSaveKm}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de pendências financeiras */}
      {totalPendente > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-800">
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <span><strong>{formatCurrency(totalPendente)}</strong> em OS finalizadas aguardando pagamento</span>
        </div>
      )}

      {/* Resumo por status */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {allStatuses.map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "todas" : s)}
            className={`rounded-xl border p-3 text-center transition-all ${filterStatus === s ? "ring-2 ring-blue-500" : "hover:shadow-sm"}`}>
            <p className="text-xl font-bold text-slate-900">{totals[s] ?? 0}</p>
            <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${statusColor[s]}`}>{statusLabel[s]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por OS, cliente, serviço ou veículo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ServiceOrderStatus | "todas")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os status</SelectItem>
            {allStatuses.map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="gap-2 flex-shrink-0" onClick={() => setShowAvulsa(true)}>
          <Plus className="w-4 h-4" /> Nova OS Avulsa
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhuma OS encontrada.</p>
          <p className="text-xs text-slate-400 mt-1">Crie uma OS avulsa ou aprove um orçamento.</p>
          <Button className="mt-4 gap-2" onClick={() => setShowAvulsa(true)}><Plus className="w-4 h-4" />Nova OS Avulsa</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const canAdvance = !!nextStatus[o.status];
            const isPaid = o.paymentStatus === "pago";
            const isFinished = ["finalizado", "entregue"].includes(o.status);
            return (
              <Card key={o.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/ordens/${o.id}`}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900">{o.osNumber}</span>
                        {o.isAvulsa && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Avulsa</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                        {isPaid
                          ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">✓ Pago · {paymentLabels[o.paymentMethod!] ?? ""}</span>
                          : isFinished && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Pagamento pendente</span>
                        }
                      </div>
                      <p className="text-sm text-slate-700 font-medium truncate">{o.serviceType}</p>
                      {o.problemDescription && <p className="text-xs text-slate-500 truncate">{o.problemDescription}</p>}
                      <p className="text-xs text-slate-500 mt-0.5">{o.customerName} · {o.vehicleInfo}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">{formatCurrency(o.totalValue)}</p>
                      <p className="text-xs text-slate-400">Entrada: {formatDate(o.entryDate)}</p>
                      {o.expectedDate && <p className="text-xs text-slate-400">Previsão: {formatDate(o.expectedDate)}</p>}
                    </div>
                  </div>

                  {/* KM */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                    <button
                      className="flex items-center gap-1 hover:text-blue-600"
                      onClick={() => setEditingKm({ id: o.id, field: "entrada", val: String(o.kmEntrada ?? "") })}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      KM entrada: <strong className="text-slate-700">{o.kmEntrada != null ? o.kmEntrada.toLocaleString("pt-BR") : "—"}</strong>
                    </button>
                    {["finalizado","entregue"].includes(o.status) && (
                      <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => setEditingKm({ id: o.id, field: "saida", val: String(o.kmSaida ?? "") })}
                      >
                        KM saída: <strong className="text-slate-700">{o.kmSaida != null ? o.kmSaida.toLocaleString("pt-BR") : "—"}</strong>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                    {o.technicianName && <span className="text-xs text-slate-500">Técnico: <strong>{o.technicianName}</strong></span>}
                    <div className="ml-auto flex gap-2 flex-wrap">
                      <TechnicianSelect
                        osId={o.id}
                        current={o.technicianName}
                        technicians={technicians.map((t) => t.name)}
                        onSave={async (name) => { await update(o.id, { technicianName: name }); toast("Técnico atribuído!"); }}
                      />
                      {!isPaid && isFinished && (
                        <Button size="sm" variant="outline" className="gap-1 border-emerald-500 text-emerald-700 hover:bg-emerald-50" onClick={() => setPayingId(o.id)}>
                          <DollarSign className="w-3.5 h-3.5" /> Dar baixa
                        </Button>
                      )}
                      <Link href={`/ordens/${o.id}/recibo`} target="_blank">
                        <Button size="sm" variant="outline" className="gap-1" title="Recibo">
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {canAdvance && (
                        <Button size="sm" className="gap-1" onClick={() => advance(o.id, o.status)}>
                          <ChevronRight className="w-3.5 h-3.5" /> Avançar
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

function TechnicianSelect({ osId, current, technicians, onSave }: {
  osId: string; current?: string; technicians: string[];
  onSave: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-xs text-blue-600 hover:underline">
      {current ? `Técnico: ${current}` : "Atribuir técnico"}
    </button>
  );
  return (
    <div className="flex gap-1 items-center">
      {technicians.length > 0
        ? <Select onValueChange={(v) => { onSave(v); setOpen(false); }}>
            <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="Técnico" /></SelectTrigger>
            <SelectContent>
              {technicians.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        : <Input className="h-7 text-xs w-36" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Nome" autoFocus />
      }
      <Button size="sm" className="h-7 text-xs px-2" onClick={() => { onSave(custom || ""); setOpen(false); }}>OK</Button>
    </div>
  );
}
