"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Car, Gauge, Calendar, Hash, X } from "lucide-react";
import { mockVehicles, mockCustomers } from "@/data/mock";

const marcas = ["Toyota","Honda","Volkswagen","Chevrolet","Ford","Hyundai","Fiat","Renault","Nissan","Jeep","BMW","Mercedes-Benz","Audi","Mitsubishi","Kia"];

function NovoVeiculoModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ customerId: "", brand: "", model: "", year: "", plate: "", mileage: "", notes: "" });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const years = Array.from({ length: 35 }, (_, i) => String(2024 - i));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Cadastrar Veículo</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Cliente *</Label>
              <Select onValueChange={(v) => update("customerId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Marca *</Label>
              <Select onValueChange={(v) => update("brand", v)}>
                <SelectTrigger><SelectValue placeholder="Marca" /></SelectTrigger>
                <SelectContent>
                  {marcas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modelo *</Label>
              <Input placeholder="Corolla, Civic..." value={form.model} onChange={(e) => update("model", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ano *</Label>
              <Select onValueChange={(v) => update("year", v)}>
                <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Placa *</Label>
              <Input placeholder="ABC-1234" value={form.plate} onChange={(e) => update("plate", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Quilometragem</Label>
              <Input type="number" placeholder="85000" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Input placeholder="Observações sobre o veículo..." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={onClose}>Salvar Veículo</Button>
        </div>
      </div>
    </div>
  );
}

export default function VeiculosPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const enriched = mockVehicles.map((v) => ({
    ...v,
    customerName: mockCustomers.find((c) => c.id === v.customerId)?.name || "—",
  }));

  const filtered = enriched.filter(
    (v) =>
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Veículos" subtitle={`${mockVehicles.length} veículos cadastrados`}>
      {showModal && <NovoVeiculoModal onClose={() => setShowModal(false)} />}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por marca, modelo, placa ou cliente..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Cadastrar Veículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-sm text-blue-600 font-medium">{vehicle.plate}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Ano</span>
                  <span className="font-semibold text-slate-800">{vehicle.year}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <Gauge className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">KM</span>
                  <span className="font-semibold text-slate-800">{vehicle.mileage.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <Hash className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Placa</span>
                  <span className="font-semibold text-slate-800 text-xs">{vehicle.plate}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Proprietário: <span className="font-medium text-slate-700">{vehicle.customerName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
