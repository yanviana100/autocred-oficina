"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Save, CreditCard } from "lucide-react";
import { useCustomers, useVehicles, useQuotes } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface Item {
  id: string;
  description: string;
  type: "peca" | "mao_de_obra";
  quantity: number;
  unitPrice: number;
}

const serviceTypes = [
  "Motor", "Câmbio", "Suspensão", "Freios", "Elétrica", "Ar-condicionado",
  "Funilaria", "Pintura", "Revisão", "Alinhamento e Balanceamento", "Escapamento", "Outro",
];

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { create: createQuote } = useQuotes();
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerId: "", vehicleId: "", serviceType: "",
    problemDescription: "", estimatedDays: "1", notes: "",
  });
  const [items, setItems] = useState<Item[]>([
    { id: "1", description: "", type: "peca", quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const availableVehicles = vehicles.filter((v) => v.customerId === form.customerId);

  const addItem = () => setItems((p) => [...p, { id: String(Date.now()), description: "", type: "peca", quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems((p) => p.filter((i) => i.id !== id)); };
  const updateItem = (id: string, key: string, value: string | number) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, [key]: value } : i)));

  const totalPecas     = items.filter((i) => i.type === "peca").reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalMaoDeObra = items.filter((i) => i.type === "mao_de_obra").reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total          = totalPecas + totalMaoDeObra;

  const handleSave = async (goToFinanciamento = false) => {
    if (!form.customerId || !form.vehicleId || !form.serviceType || !form.problemDescription) {
      toast("Preencha cliente, veículo, tipo de serviço e descrição.", "warning");
      return;
    }
    if (total === 0) { toast("Adicione pelo menos um item com valor.", "warning"); return; }

    setSaving(true);

    const customer = customers.find((c) => c.id === form.customerId);
    const vehicle  = vehicles.find((v) => v.id === form.vehicleId);

    const quoteItems = items.map((i, idx) => ({
      id: `qi_${Date.now()}_${idx}`,
      quoteId: "", // preenchido após criar
      description: i.description || "(sem descrição)",
      type: i.type,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.quantity * i.unitPrice,
    }));

    const newQuote = createQuote({
      workshopId: "w1",
      customerId: form.customerId,
      vehicleId:  form.vehicleId,
      customerName: customer?.name ?? "",
      vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.plate}` : "",
      serviceType: form.serviceType,
      problemDescription: form.problemDescription,
      estimatedDays: Number(form.estimatedDays),
      notes: form.notes,
      status: "rascunho",
      laborCost: totalMaoDeObra,
      totalValue: total,
      publicToken: `pub_${Date.now()}`,
      items: quoteItems,
    });

    toast("Orçamento salvo com sucesso!");
    setSaving(false);

    if (goToFinanciamento) {
      router.push(`/financiamento?quoteId=${newQuote.id}&amount=${total}`);
    } else {
      router.push(`/orcamentos/${newQuote.id}`);
    }
  };

  return (
    <DashboardLayout title="Novo Orçamento" subtitle="Crie um orçamento detalhado para o cliente">
      <div className="max-w-4xl">
        <Link href="/orcamentos">
          <Button variant="ghost" size="sm" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente e Veículo */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cliente e Veículo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Cliente *</Label>
                  <Select onValueChange={(v) => { update("customerId", v); update("vehicleId", ""); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {customers.length === 0
                        ? <SelectItem value="_" disabled>Nenhum cliente cadastrado</SelectItem>
                        : customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Veículo *</Label>
                  <Select disabled={!form.customerId} value={form.vehicleId} onValueChange={(v) => update("vehicleId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={form.customerId ? (availableVehicles.length ? "Selecione o veículo" : "Cliente sem veículos") : "Primeiro selecione o cliente"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year} — {v.plate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Serviço */}
            <Card>
              <CardHeader><CardTitle className="text-base">Serviço</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipo de Serviço *</Label>
                  <Select onValueChange={(v) => update("serviceType", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>{serviceTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição do problema *</Label>
                  <Textarea placeholder="Descreva o problema relatado pelo cliente..." rows={3} value={form.problemDescription} onChange={(e) => update("problemDescription", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Prazo estimado (dias)</Label>
                  <Input type="number" min={1} value={form.estimatedDays} onChange={(e) => update("estimatedDays", e.target.value)} className="w-32" />
                </div>
              </CardContent>
            </Card>

            {/* Itens */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Peças e Mão de Obra</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-slate-50 rounded-lg">
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      {index === 0 && <Label className="text-xs">Descrição</Label>}
                      <Input placeholder="Ex: Correia dentada" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="text-sm h-9" />
                    </div>
                    <div className="col-span-6 sm:col-span-2 space-y-1">
                      {index === 0 && <Label className="text-xs">Tipo</Label>}
                      <Select value={item.type} onValueChange={(v) => updateItem(item.id, "type", v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peca">Peça</SelectItem>
                          <SelectItem value="mao_de_obra">M.O.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 sm:col-span-1 space-y-1">
                      {index === 0 && <Label className="text-xs">Qtd</Label>}
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} className="text-sm h-9 text-center" />
                    </div>
                    <div className="col-span-7 sm:col-span-3 space-y-1">
                      {index === 0 && <Label className="text-xs">Valor unit. (R$)</Label>}
                      <Input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} className="text-sm h-9" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 p-1" disabled={items.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600"><span>Peças</span><span>{formatCurrency(totalPecas)}</span></div>
                  <div className="flex justify-between text-sm text-slate-600"><span>Mão de obra</span><span>{formatCurrency(totalMaoDeObra)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t"><span>Total</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Observações adicionais para o cliente..." rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar resumo */}
          <div>
            <Card className="sticky top-4">
              <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Peças</span><span className="font-medium">{formatCurrency(totalPecas)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Mão de obra</span><span className="font-medium">{formatCurrency(totalMaoDeObra)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full gap-2" onClick={() => handleSave(false)} disabled={saving}>
                    <Save className="w-4 h-4" />{saving ? "Salvando..." : "Salvar Orçamento"}
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-green-500 text-green-700 hover:bg-green-50" onClick={() => handleSave(true)} disabled={saving || total === 0}>
                    <CreditCard className="w-4 h-4" />Solicitar Crédito
                  </Button>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-100 leading-relaxed">
                  <strong>Simulação apenas:</strong> o financiamento não é aprovado automaticamente. A análise é feita por parceiro financeiro autorizado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
