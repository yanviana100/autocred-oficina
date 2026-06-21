"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Car, Gauge, Calendar, X, Pencil, Trash2, User, AlertTriangle } from "lucide-react";
import { useVehicles, useCustomers } from "@/hooks/useStore";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/db";
import type { Vehicle } from "@/types";

const marcas = ["Toyota","Honda","Volkswagen","Chevrolet","Ford","Hyundai","Fiat","Renault","Nissan","Jeep","BMW","Mercedes-Benz","Audi","Mitsubishi","Kia"];
const cores = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege"];
const emptyForm = { customerId: "", brand: "", model: "", year: "", plate: "", color: "", mileage: "", chassis: "", notes: "" };

function VeiculoModal({ initial, customers, onSave, onClose }: {
  initial?: Partial<Vehicle>;
  customers: { id: string; name: string }[];
  onSave: (data: Omit<Vehicle, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initial, year: String(initial?.year ?? ""), mileage: String(initial?.mileage ?? "") });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial?.id;
  const years = Array.from({ length: 37 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, year: Number(form.year), mileage: Number(form.mileage) } as Omit<Vehicle, "id">);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Editar Veículo" : "Cadastrar Veículo"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Cliente *</Label>
                <Select value={form.customerId} onValueChange={(v) => update("customerId", v)} required>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Marca *</Label>
                <Select value={form.brand} onValueChange={(v) => update("brand", v)} required>
                  <SelectTrigger><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent>{marcas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Modelo *</Label><Input placeholder="Corolla, Civic..." value={form.model} onChange={(e) => update("model", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Ano *</Label>
                <Select value={form.year} onValueChange={(v) => update("year", v)} required>
                  <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                  <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Placa *</Label><Input placeholder="ABC-1D23" value={form.plate} onChange={(e) => update("plate", e.target.value.toUpperCase())} required /></div>
              <div className="space-y-1.5"><Label>Cor</Label>
                <Select value={form.color ?? ""} onValueChange={(v) => update("color", v)}>
                  <SelectTrigger><SelectValue placeholder="Cor" /></SelectTrigger>
                  <SelectContent>{cores.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Quilometragem *</Label><Input type="number" min={0} placeholder="45000" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} required /></div>
              <div className="col-span-2 space-y-1.5"><Label>Chassi</Label><Input placeholder="9BWZZZ377VT004251" value={form.chassis ?? ""} onChange={(e) => update("chassis", e.target.value.toUpperCase())} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Observações</Label><Input placeholder="Veículo em bom estado, sem multas..." value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} /></div>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1">{isEdit ? "Salvar alterações" : "Cadastrar veículo"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VeiculosPage() {
  const { vehicles, create, update, remove } = useVehicles();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "new" | Vehicle>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<string | null>(null);

  const handleDeleteClick = async (vehicleId: string) => {
    const supabase = getSupabase();
    const { data: openQuotes } = await supabase
      .from("quotes")
      .select("id")
      .eq("vehicle_id", vehicleId)
      .not("status", "in", '("concluido","recusado")')
      .limit(1);
    if (openQuotes && openQuotes.length > 0) {
      setDeleteBlocked(vehicleId);
    } else {
      setConfirmDelete(vehicleId);
    }
  };

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name ?? "—";

  const filtered = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    getCustomerName(v.customerId).toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Omit<Vehicle, "id">) => {
    if (modal === "new") { await create(data); toast("Veículo cadastrado!"); }
    else if (modal && typeof modal === "object") { await update((modal as Vehicle).id, data); toast("Veículo atualizado!"); }
    setModal(null);
  };

  return (
    <DashboardLayout title="Veículos" subtitle={`${vehicles.length} veículos cadastrados`}>
      {modal !== null && <VeiculoModal initial={modal === "new" ? undefined : (modal as Vehicle)} customers={customers} onSave={handleSave} onClose={() => setModal(null)} />}
      {deleteBlocked && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Não é possível excluir</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Este veículo possui orçamentos em aberto. Conclua ou recuse todos os orçamentos antes de excluí-lo.</p>
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
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={async () => { await remove(confirmDelete); setConfirmDelete(null); toast("Veículo removido.", "warning"); }}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por placa, modelo, marca ou cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setModal("new")} className="gap-2 flex-shrink-0"><Plus className="w-4 h-4" /> Cadastrar Veículo</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <a href={`/veiculos/${v.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Car className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="font-semibold text-slate-900">{v.brand} {v.model}</p><p className="text-xs text-slate-500">{v.plate}</p></div>
                </a>
                <div className="flex gap-1">
                  <button onClick={() => setModal(v)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteClick(v.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mt-3 pt-3 border-t">
                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{v.year}</div>
                <div className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{v.mileage.toLocaleString("pt-BR")} km</div>
                {v.color && <div>{v.color}</div>}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 pt-2 border-t">
                <User className="w-3.5 h-3.5" />{getCustomerName(v.customerId)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-1">{search ? "Nenhum veículo encontrado." : "Nenhum veículo cadastrado ainda."}</p>
          <Button className="mt-4 gap-2" onClick={() => setModal("new")}><Plus className="w-4 h-4" /> Cadastrar veículo</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
