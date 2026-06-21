"use client";
import { use } from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Car, FileText, CreditCard, Share2, CheckCircle, Copy, Printer, Pencil, Trash2, Plus, Save, X } from "lucide-react";
import { useQuotes } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, quoteStatusLabel, quoteStatusColor } from "@/lib/utils";
import type { Quote, QuoteStatus, QuoteItem } from "@/types";

const statusFlow: QuoteStatus[] = ["rascunho", "enviado", "aguardando_aprovacao", "aprovado", "concluido"];
const serviceTypes = ["Motor","Câmbio","Suspensão","Freios","Elétrica","Ar-condicionado","Funilaria","Pintura","Revisão","Alinhamento e Balanceamento","Escapamento","Outro"];

export default function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { get, update, approve } = useQuotes();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editServiceType, setEditServiceType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDays, setEditDays] = useState("1");
  const [editNotes, setEditNotes] = useState("");
  const [editItems, setEditItems] = useState<QuoteItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get(id).then((q) => { setQuote(q); setLoadingQuote(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const startEdit = () => {
    if (!quote) return;
    setEditServiceType(quote.serviceType);
    setEditDescription(quote.problemDescription);
    setEditDays(String(quote.estimatedDays));
    setEditNotes(quote.notes ?? "");
    setEditItems(quote.items.map((i) => ({ ...i })));
    setEditing(true);
  };

  const updateItem = (itemId: string, key: string, val: string | number) =>
    setEditItems((prev) => prev.map((i) => i.id === itemId ? { ...i, [key]: val, total: key === "quantity" ? Number(val) * i.unitPrice : key === "unitPrice" ? i.quantity * Number(val) : i.total } : i));

  const addItem = () => setEditItems((prev) => [...prev, { id: `new_${Date.now()}`, quoteId: id, description: "", type: "peca", quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (itemId: string) => { if (editItems.length > 1) setEditItems((prev) => prev.filter((i) => i.id !== itemId)); };

  const editTotal = editItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const editLaborCost = editItems.filter((i) => i.type === "mao_de_obra").reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSaveEdit = async () => {
    if (!quote) return;
    const invalid = editItems.filter((i) => !i.description.trim() || i.unitPrice <= 0);
    if (invalid.length > 0) { toast("Todos os itens precisam ter descrição e valor.", "warning"); return; }
    setSaving(true);
    await update(id, {
      serviceType: editServiceType,
      problemDescription: editDescription,
      estimatedDays: Number(editDays),
      notes: editNotes,
      totalValue: editTotal,
      laborCost: editLaborCost,
      items: editItems.map((i) => ({ ...i, total: i.quantity * i.unitPrice })),
    });
    const refreshed = await get(id);
    setQuote(refreshed);
    setEditing(false);
    setSaving(false);
    toast("Orçamento atualizado!");
  };

  if (loadingQuote) {
    return <DashboardLayout title="Carregando..." subtitle=""><div className="animate-pulse h-4 bg-slate-200 rounded w-48" /></DashboardLayout>;
  }

  if (!quote) {
    return (
      <DashboardLayout title="Orçamento não encontrado" subtitle="">
        <p className="text-sm text-slate-500 mb-4">Este orçamento não existe ou foi removido.</p>
        <Link href="/orcamentos"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link>
      </DashboardLayout>
    );
  }

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    try {
      if (newStatus === "aprovado") {
        const result = await approve(quote.id);
        if (result) {
          setQuote(result.quote);
          toast(`Orçamento aprovado! OS ${result.serviceOrder.os_number} criada automaticamente.`);
        } else {
          toast("Erro ao aprovar orçamento. Tente novamente.", "warning");
        }
      } else {
        await update(quote.id, { status: newStatus });
        setQuote({ ...quote, status: newStatus });
        toast("Status atualizado!");
      }
    } catch {
      toast("Erro inesperado. Tente novamente.", "warning");
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/orcamento/publico?token=${quote.publicToken}`;
    navigator.clipboard.writeText(url).then(() => toast("Link copiado!"));
  };

  const totalPecas     = quote.items.filter((i) => i.type === "peca").reduce((s, i) => s + i.total, 0);
  const totalMaoDeObra = quote.items.filter((i) => i.type === "mao_de_obra").reduce((s, i) => s + i.total, 0);
  const canEdit = ["rascunho", "enviado"].includes(quote.status);

  return (
    <DashboardLayout title={`Orçamento — ${quote.customerName}`} subtitle={`Criado em ${formatDate(quote.createdAt)}`}>
      <Link href="/orcamentos">
        <Button variant="ghost" size="sm" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Voltar</Button>
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl">
        <div className="xl:col-span-2 space-y-5">
          {/* Header card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{quote.serviceType}</h2>
                    <p className="text-sm text-slate-500">{quote.vehicleInfo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${quoteStatusColor[quote.status]}`}>
                    {quoteStatusLabel[quote.status]}
                  </span>
                  {canEdit && !editing && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={startEdit}>
                      <Pencil className="w-3.5 h-3.5" />Editar
                    </Button>
                  )}
                </div>
              </div>
              {!editing && quote.problemDescription && (
                <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{quote.problemDescription}</p>
              )}
            </CardContent>
          </Card>

          {/* Modo edição */}
          {editing && (
            <Card className="border-blue-300 ring-1 ring-blue-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-blue-700">Editando orçamento</CardTitle>
                <button onClick={() => setEditing(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-medium">Tipo de serviço</label>
                    <Select value={editServiceType} onValueChange={setEditServiceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{serviceTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea rows={2} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Prazo (dias)</label>
                    <Input type="number" min={1} value={editDays} onChange={(e) => setEditDays(e.target.value)} className="w-24" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Itens</label>
                    <Button variant="outline" size="sm" onClick={addItem} className="gap-1 h-7 text-xs"><Plus className="w-3 h-3" />Adicionar</Button>
                  </div>
                  {editItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded-lg">
                      <div className="col-span-12 sm:col-span-5">
                        <Input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <Select value={item.type} onValueChange={(v) => updateItem(item.id, "type", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="peca">Peça</SelectItem><SelectItem value="mao_de_obra">M.O.</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 sm:col-span-1">
                        <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} className="h-8 text-sm text-center" />
                      </div>
                      <div className="col-span-8 sm:col-span-3">
                        <Input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} className="h-8 text-sm" placeholder="R$" />
                      </div>
                      <div className="col-span-4 sm:col-span-1 flex justify-end">
                        <button onClick={() => removeItem(item.id)} disabled={editItems.length === 1} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-blue-600 pt-2 border-t text-sm">
                    <span>Total</span><span>{formatCurrency(editTotal)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea rows={2} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Observações para o cliente..." />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button className="flex-1 gap-2" onClick={handleSaveEdit} disabled={saving}>
                    <Save className="w-4 h-4" />{saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados cliente/veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div><p className="text-xs text-slate-500">Cliente</p><p className="font-semibold">{quote.customerName}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Car className="w-5 h-5 text-blue-500" />
                <div><p className="text-xs text-slate-500">Veículo</p><p className="font-semibold text-sm">{quote.vehicleInfo}</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Itens */}
          {!editing && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Itens do orçamento</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-xs text-slate-400">
                      <th className="pb-2">Descrição</th><th className="pb-2">Tipo</th><th className="pb-2 text-center">Qtd</th><th className="pb-2 text-right">Unit.</th><th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {quote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 pr-3 font-medium">{item.description}</td>
                        <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded text-xs ${item.type === "peca" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>{item.type === "peca" ? "Peça" : "M.O."}</span></td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right text-slate-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr><td colSpan={4} className="pt-3 text-slate-500">Peças</td><td className="pt-3 text-right font-medium">{formatCurrency(totalPecas)}</td></tr>
                    <tr><td colSpan={4} className="pb-1 text-slate-500">Mão de obra</td><td className="pb-1 text-right font-medium">{formatCurrency(totalMaoDeObra)}</td></tr>
                    <tr className="text-lg font-bold border-t"><td colSpan={4} className="pt-2">Total</td><td className="pt-2 text-right text-blue-600">{formatCurrency(quote.totalValue)}</td></tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar ações */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Alterar status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Select value={quote.status} onValueChange={(v) => handleStatusChange(v as QuoteStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusFlow.map((s) => <SelectItem key={s} value={s}>{quoteStatusLabel[s]}</SelectItem>)}
                  <SelectItem value="recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
              {(quote.status === "enviado" || quote.status === "aguardando_aprovacao") && (
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange("aprovado")}>
                  <CheckCircle className="w-4 h-4" />Aprovar orçamento
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Prazo</span><span className="font-medium">{quote.estimatedDays} dia{quote.estimatedDays !== 1 ? "s" : ""}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Peças</span><span className="font-medium">{formatCurrency(totalPecas)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mão de obra</span><span className="font-medium">{formatCurrency(totalMaoDeObra)}</span></div>
              <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span className="text-blue-600">{formatCurrency(quote.totalValue)}</span></div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Link href={`/orcamentos/${quote.id}/imprimir`} target="_blank">
              <Button className="w-full gap-2 bg-slate-800 hover:bg-slate-700">
                <Printer className="w-4 h-4" />Imprimir / Salvar PDF
              </Button>
            </Link>
            <Button variant="outline" className="w-full gap-2" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />Copiar link do cliente
            </Button>
            <Link href={`/orcamento/publico?token=${quote.publicToken}`} target="_blank">
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />Ver página do cliente
              </Button>
            </Link>
            <Link href={`/financiamento?quoteId=${quote.id}&amount=${quote.totalValue}`}>
              <Button className="w-full gap-2 mt-1">
                <CreditCard className="w-4 h-4" />Solicitar crédito
              </Button>
            </Link>
          </div>

          {quote.notes && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4"><p className="text-xs text-amber-800"><strong>Obs:</strong> {quote.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
