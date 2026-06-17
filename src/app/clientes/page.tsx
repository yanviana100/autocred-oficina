"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, User, Phone, Mail, MapPin, X, Car } from "lucide-react";
import { mockCustomers, mockVehicles, mockQuotes } from "@/data/mock";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

const estados = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

function NovoClienteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", cpf: "", whatsapp: "", email: "", address: "", city: "", state: "" });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Novo Cliente</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome completo *</Label>
              <Input placeholder="João da Silva" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF *</Label>
              <Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => update("cpf", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp *</Label>
              <Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" placeholder="joao@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input placeholder="Rua das Flores, 123" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade *</Label>
              <Input placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado *</Label>
              <Select onValueChange={(v) => update("state", v)}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={onClose}>Salvar Cliente</Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search)
  );

  const getVehicleCount = (customerId: string) => mockVehicles.filter((v) => v.customerId === customerId).length;
  const getLastQuote = (customerId: string) => {
    const quotes = mockQuotes.filter((q) => q.customerId === customerId);
    if (!quotes.length) return null;
    return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  return (
    <DashboardLayout title="Clientes" subtitle={`${mockCustomers.length} clientes cadastrados`}>
      {showModal && <NovoClienteModal onClose={() => setShowModal(false)} />}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const lastQuote = getLastQuote(customer.id);
          const vehicleCount = getVehicleCount(customer.id);
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{customer.name}</h3>
                    <p className="text-xs text-slate-500">{customer.cpf}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{customer.whatsapp}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{customer.city}, {customer.state}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Car className="w-3.5 h-3.5" />
                    <span>{vehicleCount} veículo{vehicleCount !== 1 ? "s" : ""}</span>
                  </div>
                  {lastQuote && (
                    <div className="text-xs text-slate-500">
                      Último: {formatDate(lastQuote.createdAt)}
                    </div>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                    Ativo
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum cliente encontrado</p>
          <Button className="mt-4 gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Cadastrar primeiro cliente
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
