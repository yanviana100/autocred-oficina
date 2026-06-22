"use client";
import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, User, Phone, Mail, MapPin, X, Car, Pencil, Trash2, ChevronRight, AlertTriangle } from "lucide-react";
import { useCustomers, useVehicles, useQuotes } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

const estados = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const marcas = ["Toyota","Honda","Volkswagen","Chevrolet","Ford","Hyundai","Fiat","Renault","Nissan","Jeep","Mitsubishi","Kia","Outras"];
const emptyForm = { name: "", cpf: "", whatsapp: "", email: "", address: "", city: "", state: "" };

interface VehicleForm { plate: string; brand: string; model: string; year: string; mileage: string; color: string; }
const emptyVehicle = (): VehicleForm => ({ plate: "", brand: "", model: "", year: "", mileage: "", color: "" });

function ClienteModal({ initial, onSave, onClose }: {
  initial?: Partial<Customer>;
  onSave: (data: Omit<Customer, "id" | "createdAt" | "workshopId">, vehicles: VehicleForm[]) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const [vehicles, setVehicles] = useState<VehicleForm[]>([]);
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial?.id;
  const years = Array.from({ length: 37 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  const updateVehicle = (i: number, k: keyof VehicleForm, v: string) =>
    setVehicles((prev) => prev.map((veh, idx) => idx === i ? { ...veh, [k]: v } : veh));

  const addVehicle = () => setVehicles((prev) => [...prev, emptyVehicle()]);
  const removeVehicle = (i: number) => setVehicles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Omit<Customer, "id" | "createdAt" | "workshopId">, vehicles);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">{isEdit ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Nome completo *</Label><Input placeholder="João da Silva" value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>CPF</Label><Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => update("cpf", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>WhatsApp *</Label><Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required /></div>
              <div className="col-span-2 space-y-1.5"><Label>E-mail</Label><Input type="email" placeholder="joao@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Endereço</Label><Input placeholder="Rua das Flores, 123" value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cidade</Label><Input placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Estado</Label>
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Seção de veículos — só aparece na criação */}
            {!isEdit && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Veículos</span>
                    <span className="text-xs text-slate-400">(opcional)</span>
                  </div>
                  <button type="button" onClick={addVehicle} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Adicionar veículo
                  </button>
                </div>

                {vehicles.length === 0 && (
                  <button type="button" onClick={addVehicle} className="w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                    + Adicionar veículo ao cadastro
                  </button>
                )}

                <div className="space-y-4">
                  {vehicles.map((v, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50 relative">
                      <button type="button" onClick={() => removeVehicle(i)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Veículo {i + 1}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Placa *</Label>
                          <Input
                            placeholder="ABC-1D23"
                            className="uppercase tracking-widest font-mono"
                            value={v.plate}
                            onChange={(e) => updateVehicle(i, "plate", e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Marca *</Label>
                          <Select value={v.brand} onValueChange={(val) => updateVehicle(i, "brand", val)}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Marca" /></SelectTrigger>
                            <SelectContent>{marcas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Modelo *</Label>
                          <Input placeholder="Gol, Civic..." className="h-9" value={v.model} onChange={(e) => updateVehicle(i, "model", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ano *</Label>
                          <Select value={v.year} onValueChange={(val) => updateVehicle(i, "year", val)}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Ano" /></SelectTrigger>
                            <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">KM atual</Label>
                          <Input type="number" min={0} placeholder="45000" className="h-9" value={v.mileage} onChange={(e) => updateVehicle(i, "mileage", e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Cor</Label>
                          <Input placeholder="Branco, Prata..." className="h-9" value={v.color} onChange={(e) => updateVehicle(i, "color", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 p-6 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1">{isEdit ? "Salvar alterações" : "Cadastrar cliente"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const { customers, create, update, remove } = useCustomers();
  const { byCustomer: vehiclesByCustomer, create: createVehicle } = useVehicles();
  const { byCustomer: quotesByCustomer } = useQuotes();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "new" | Customer>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<string | null>(null);

  const handleDeleteClick = async (customerId: string) => {
    const supabase = getSupabase();
    const { data: openQuotes } = await supabase
      .from("quotes")
      .select("id")
      .eq("customer_id", customerId)
      .not("status", "in", '("concluido","recusado")')
      .limit(1);
    if (openQuotes && openQuotes.length > 0) {
      setDeleteBlocked(customerId);
    } else {
      setConfirmDelete(customerId);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.whatsapp.includes(search) || c.cpf.includes(search)
  );

  const handleSave = async (data: Omit<Customer, "id" | "createdAt" | "workshopId">, vehicles: VehicleForm[]) => {
    if (modal === "new") {
      const customer = await create(data as Omit<Customer, "id" | "createdAt">);
      if (customer && vehicles.length > 0) {
        const validVehicles = vehicles.filter((v) => v.plate.trim() && v.brand && v.model.trim() && v.year);
        for (const v of validVehicles) {
          await createVehicle({
            customerId: customer.id,
            workshopId: customer.workshopId,
            plate: v.plate.trim().toUpperCase(),
            brand: v.brand,
            model: v.model.trim(),
            year: Number(v.year),
            mileage: Number(v.mileage) || 0,
            color: v.color.trim() || undefined,
          });
        }
      }
      toast(vehicles.filter((v) => v.plate.trim()).length > 0 ? "Cliente e veículo(s) cadastrados!" : "Cliente cadastrado!");
    } else if (modal && typeof modal === "object") {
      await update((modal as Customer).id, data);
      toast("Cliente atualizado!");
    }
    setModal(null);
  };

  return (
    <DashboardLayout title="Clientes" subtitle={`${customers.length} clientes cadastrados`}>
      {modal !== null && <ClienteModal initial={modal === "new" ? undefined : (modal as Customer)} onSave={handleSave} onClose={() => setModal(null)} />}
      {deleteBlocked && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Não é possível excluir</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Este cliente possui orçamentos em aberto. Conclua ou recuse todos os orçamentos antes de excluí-lo.</p>
            <Button className="w-full" onClick={() => setDeleteBlocked(null)}>Entendido</Button>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={async () => { await remove(confirmDelete); setConfirmDelete(null); toast("Cliente removido.", "warning"); }}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por nome, CPF, e-mail ou telefone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setModal("new")} className="gap-2 flex-shrink-0"><Plus className="w-4 h-4" /> Novo Cliente</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const vehicles = vehiclesByCustomer(customer.id);
          const quotes = quotesByCustomer(customer.id);
          const lastQuote = quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-blue-600" /></div>
                    <div className="min-w-0"><h3 className="font-semibold text-slate-900 truncate">{customer.name}</h3><p className="text-xs text-slate-500">{customer.cpf}</p></div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setModal(customer)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteClick(customer.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.whatsapp}</span></div>
                  {customer.email && <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.email}</span></div>}
                  {customer.city && <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.city}{customer.state ? `, ${customer.state}` : ""}</span></div>}
                </div>
                {vehicles.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {vehicles.slice(0, 2).map((v) => (
                      <div key={v.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Car className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{v.brand} {v.model} {v.year} · <span className="font-mono font-semibold">{v.plate}</span></span>
                      </div>
                    ))}
                    {vehicles.length > 2 && <p className="text-xs text-slate-400 pl-4">+{vehicles.length - 2} veículo{vehicles.length - 2 > 1 ? "s" : ""}</p>}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500"><Car className="w-3.5 h-3.5" />{vehicles.length} veículo{vehicles.length !== 1 ? "s" : ""}</span>
                  {lastQuote && <span className="text-xs text-slate-500">Último: {formatDate(lastQuote.createdAt)}</span>}
                  <Link href={`/clientes/${customer.id}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Histórico <ChevronRight className="w-3 h-3" /></Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-1">{search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}</p>
          <Button className="mt-4 gap-2" onClick={() => setModal("new")}><Plus className="w-4 h-4" /> Cadastrar primeiro cliente</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
