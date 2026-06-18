"use client";
import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, User, Phone, Mail, MapPin, X, Car, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useCustomers, useVehicles, useQuotes } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

const estados = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const emptyForm = { name: "", cpf: "", whatsapp: "", email: "", address: "", city: "", state: "" };

function ClienteModal({ initial, onSave, onClose }: {
  initial?: Partial<Customer>;
  onSave: (data: Omit<Customer, "id" | "createdAt" | "workshopId">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial?.id;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Omit<Customer, "id" | "createdAt" | "workshopId">);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Nome completo *</Label><Input placeholder="João da Silva" value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>CPF *</Label><Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => update("cpf", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>WhatsApp *</Label><Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required /></div>
              <div className="col-span-2 space-y-1.5"><Label>E-mail</Label><Input type="email" placeholder="joao@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Endereço</Label><Input placeholder="Rua das Flores, 123" value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cidade *</Label><Input placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Estado *</Label>
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t">
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
  const { byCustomer: vehiclesByCustomer } = useVehicles();
  const { byCustomer: quotesByCustomer } = useQuotes();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "new" | Customer>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.whatsapp.includes(search) || c.cpf.includes(search)
  );

  const handleSave = (data: Omit<Customer, "id" | "createdAt" | "workshopId">) => {
    if (modal === "new") { create(data as Omit<Customer, "id" | "createdAt">); toast("Cliente cadastrado!"); }
    else if (modal && typeof modal === "object") { update((modal as Customer).id, data); toast("Cliente atualizado!"); }
    setModal(null);
  };

  return (
    <DashboardLayout title="Clientes" subtitle={`${customers.length} clientes cadastrados`}>
      {modal !== null && <ClienteModal initial={modal === "new" ? undefined : (modal as Customer)} onSave={handleSave} onClose={() => setModal(null)} />}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => { remove(confirmDelete); setConfirmDelete(null); toast("Cliente removido.", "warning"); }}>Excluir</Button>
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
                    <button onClick={() => setConfirmDelete(customer.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.whatsapp}</span></div>
                  {customer.email && <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.email}</span></div>}
                  <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><span className="truncate">{customer.city}, {customer.state}</span></div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
