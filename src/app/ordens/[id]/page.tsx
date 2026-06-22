"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, User, Car, Wrench, DollarSign, Printer,
  ChevronRight, Gauge, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { useServiceOrders, useTechnicians } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ServiceOrder, ServiceOrderStatus, PaymentMethod } from "@/types";

const statusLabel: Record<ServiceOrderStatus, string> = {
  recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
  aguardando_peca: "Aguardando peça", finalizado: "Finalizado", entregue: "Entregue",
};
const statusColor: Record<ServiceOrderStatus, string> = {
  recebido: "bg-slate-100 text-slate-700", em_analise: "bg-blue-100 text-blue-700",
  em_execucao: "bg-violet-100 text-violet-700", aguardando_peca: "bg-amber-100 text-amber-700",
  finalizado: "bg-emerald-100 text-emerald-700", entregue: "bg-green-100 text-green-700",
};
const allStatuses: ServiceOrderStatus[] = ["recebido", "em_analise", "em_execucao", "aguardando_peca", "finalizado", "entregue"];
const nextStatus: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  recebido: "em_analise", em_analise: "em_execucao", em_execucao: "finalizado",
  aguardando_peca: "em_execucao", finalizado: "entregue",
};
const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro", pix: "Pix", cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito", boleto: "Boleto", cheque: "Cheque",
};

export default function OrdemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { get, updateStatus, update, markAsPaid } = useServiceOrders();
  const { technicians } = useTechnicians();
  const { toast } = useToast();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("pix");
  const [paying, setPaying] = useState(false);
  const [editingKm, setEditingKm] = useState<{ field: "entrada" | "saida"; val: string } | null>(null);
  const [editingTech, setEditingTech] = useState(false);
  const [techName, setTechName] = useState("");

  useEffect(() => {
    get(id).then((o) => {
      setOrder(o);
      if (o) setTechName(o.technicianName ?? "");
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="OS" subtitle="">
        <div className="p-12 text-center text-slate-400">Carregando...</div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="OS" subtitle="">
        <div className="p-12 text-center text-slate-400">Ordem de serviço não encontrada.</div>
      </DashboardLayout>
    );
  }

  const isFinished = ["finalizado", "entregue"].includes(order.status);
  const isPaid = order.paymentStatus === "pago";
  const canAdvance = !!nextStatus[order.status];

  const handleAdvance = async () => {
    const next = nextStatus[order.status];
    if (!next) return;
    setAdvancing(true);
    await updateStatus(id, next);
    setOrder({ ...order, status: next });
    toast(`OS → ${statusLabel[next]}`);
    setAdvancing(false);
  };

  const handlePay = async () => {
    setPaying(true);
    await markAsPaid(id, payMethod);
    setOrder({ ...order, paymentStatus: "pago", paymentMethod: payMethod });
    setShowPayModal(false);
    toast("Pagamento registrado!");
    setPaying(false);
  };

  const handleSaveKm = async () => {
    if (!editingKm) return;
    const val = Number(editingKm.val);
    if (isNaN(val) || val < 0) { toast("KM inválido.", "warning"); return; }
    await update(id, editingKm.field === "entrada" ? { kmEntrada: val } : { kmSaida: val });
    setOrder({ ...order, ...(editingKm.field === "entrada" ? { kmEntrada: val } : { kmSaida: val }) });
    setEditingKm(null);
    toast("KM salvo!");
  };

  const handleSaveTech = async () => {
    await update(id, { technicianName: techName });
    setOrder({ ...order, technicianName: techName });
    setEditingTech(false);
    toast("Técnico atribuído!");
  };

  const handleStatusChange = async (newStatus: ServiceOrderStatus) => {
    await updateStatus(id, newStatus);
    setOrder({ ...order, status: newStatus });
    toast(`Status → ${statusLabel[newStatus]}`);
  };

  // Progress bar
  const statusIndex = allStatuses.indexOf(order.status);
  const progressPct = Math.round(((statusIndex + 1) / allStatuses.length) * 100);

  return (
    <DashboardLayout title={order.osNumber} subtitle={`${order.serviceType} · ${order.customerName}`}>

      {/* Modal pagamento */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-1">Registrar pagamento</h3>
            <p className="text-sm text-slate-500 mb-4">Valor: <strong>{formatCurrency(order.totalValue)}</strong></p>
            <Label className="mb-1.5 block">Forma de pagamento</Label>
            <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(paymentLabels) as [PaymentMethod, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayModal(false)}>Cancelar</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePay} disabled={paying}>
                {paying ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal KM */}
      {editingKm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6">
            <h3 className="font-semibold mb-4">KM de {editingKm.field === "entrada" ? "entrada" : "saída"}</h3>
            <Input type="number" min={0} autoFocus value={editingKm.val}
              onChange={(e) => setEditingKm((p) => p ? { ...p, val: e.target.value } : p)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveKm()}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditingKm(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSaveKm}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">

        {/* Header actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push("/ordens")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <Link href={`/ordens/${id}/recibo`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Imprimir recibo
            </Button>
          </Link>
          {!isPaid && isFinished && (
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowPayModal(true)}>
              <DollarSign className="w-3.5 h-3.5" /> Dar baixa
            </Button>
          )}
          {canAdvance && (
            <Button size="sm" className="gap-1.5" onClick={handleAdvance} disabled={advancing}>
              <ChevronRight className="w-3.5 h-3.5" />
              {advancing ? "Avançando..." : `Avançar → ${statusLabel[nextStatus[order.status]!]}`}
            </Button>
          )}
        </div>

        {/* Progress de status */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
                {isPaid
                  ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pago · {paymentLabels[order.paymentMethod!]}</span>
                  : isFinished && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pagamento pendente</span>
                }
              </div>
              <Select value={order.status} onValueChange={(v) => handleStatusChange(v as ServiceOrderStatus)}>
                <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStatuses.map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              {allStatuses.map((s, i) => (
                <span key={s} className={`text-xs ${i <= statusIndex ? "text-blue-600 font-medium" : "text-slate-300"}`}>
                  {s === "em_analise" ? "Análise" : s === "em_execucao" ? "Execução" : s === "aguardando_peca" ? "Ag. peça" : statusLabel[s]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Cliente e veículo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Cliente & Veículo</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div><p className="text-xs text-slate-400">Cliente</p><p className="font-semibold text-slate-900">{order.customerName}</p></div>
              <div><p className="text-xs text-slate-400">Veículo</p><p className="font-semibold text-slate-900">{order.vehicleInfo}</p></div>
              <div className="flex gap-4">
                <button
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  onClick={() => setEditingKm({ field: "entrada", val: String(order.kmEntrada ?? "") })}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  KM entrada: <strong className="text-slate-700">{order.kmEntrada != null ? order.kmEntrada.toLocaleString("pt-BR") : "—"}</strong>
                </button>
                {isFinished && (
                  <button
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                    onClick={() => setEditingKm({ field: "saida", val: String(order.kmSaida ?? "") })}
                  >
                    KM saída: <strong className="text-slate-700">{order.kmSaida != null ? order.kmSaida.toLocaleString("pt-BR") : "—"}</strong>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Serviço */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Wrench className="w-4 h-4 text-violet-600" /> Serviço</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div><p className="text-xs text-slate-400">Tipo</p><p className="font-semibold text-slate-900">{order.serviceType}</p></div>
              {order.problemDescription && <div><p className="text-xs text-slate-400">Descrição</p><p className="text-slate-700">{order.problemDescription}</p></div>}
              {order.notes && <div><p className="text-xs text-slate-400">Observações</p><p className="text-slate-500">{order.notes}</p></div>}
              <div>
                <p className="text-xs text-slate-400 mb-1">Técnico responsável</p>
                {editingTech ? (
                  <div className="flex gap-2">
                    {technicians.length > 0
                      ? <Select value={techName} onValueChange={setTechName}>
                          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                        </Select>
                      : <Input className="h-8 text-xs flex-1" value={techName} onChange={(e) => setTechName(e.target.value)} placeholder="Nome do técnico" autoFocus />
                    }
                    <Button size="sm" className="h-8 text-xs px-3" onClick={handleSaveTech}>OK</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => setEditingTech(false)}>✕</Button>
                  </div>
                ) : (
                  <button onClick={() => setEditingTech(true)} className="text-sm text-blue-600 hover:underline">
                    {order.technicianName || "Atribuir técnico"}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /> Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div><p className="text-xs text-slate-400">Valor total</p><p className="text-2xl font-bold text-slate-900">{formatCurrency(order.totalValue)}</p></div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-slate-400">Pagamento</p>
                  <p className={`font-semibold ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                    {isPaid ? `Pago · ${paymentLabels[order.paymentMethod!] ?? ""}` : "Pendente"}
                  </p>
                </div>
                {order.paidAt && <div><p className="text-xs text-slate-400">Data pagamento</p><p className="font-medium">{formatDate(order.paidAt)}</p></div>}
              </div>
              {!isPaid && isFinished && (
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setShowPayModal(true)}>
                  <DollarSign className="w-3.5 h-3.5" /> Registrar pagamento
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-600" /> Datas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div><p className="text-xs text-slate-400">Entrada</p><p className="font-semibold">{formatDate(order.entryDate)}</p></div>
              {order.expectedDate && <div><p className="text-xs text-slate-400">Previsão de entrega</p><p className="font-semibold">{formatDate(order.expectedDate)}</p></div>}
              {order.completedDate && <div><p className="text-xs text-slate-400">Concluída em</p><p className="font-semibold text-emerald-600">{formatDate(order.completedDate)}</p></div>}
              <div><p className="text-xs text-slate-400">Criada em</p><p className="text-slate-500">{formatDate(order.createdAt)}</p></div>
              {order.isAvulsa && <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">OS Avulsa</span>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
