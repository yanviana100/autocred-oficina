"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Phone, Mail, MapPin, FileText, Save, CheckCircle, UserCog, Plus, Trash2, ImagePlus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/db";
import { useToast } from "@/components/ui/toast";
import { useTechnicians } from "@/hooks/useStore";

const estados = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const planLabel: Record<string, string> = { starter: "Starter", pro: "Pro", premium: "Premium" };
const planColor: Record<string, string> = { starter: "bg-slate-100 text-slate-700", pro: "bg-blue-100 text-blue-700", premium: "bg-amber-100 text-amber-700" };

export default function PerfilPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { technicians, create: createTech, remove: removeTech } = useTechnicians();
  const [newTechName, setNewTechName] = useState("");
  const [newTechPhone, setNewTechPhone] = useState("");
  const [form, setForm] = useState({ name: "", owner: "", cnpj: "", whatsapp: "", email: "", city: "", state: "", plan: "starter" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    supabase.from("workshops").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name ?? "",
          owner: data.owner ?? "",
          cnpj: data.cnpj ?? "",
          whatsapp: data.whatsapp ?? "",
          email: data.email ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          plan: data.plan ?? "starter",
        });
        setLogoUrl(data.logo_url ?? null);
      }
      setLoading(false);
    });
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast("Imagem muito grande. Máximo 2MB.", "warning"); return; }
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      toast("Formato inválido. Use PNG, JPG, WEBP ou SVG.", "warning"); return;
    }
    setUploadingLogo(true);
    const supabase = getSupabase();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (upErr) { toast("Erro ao enviar imagem.", "error"); setUploadingLogo(false); return; }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const url = urlData.publicUrl + `?t=${Date.now()}`;
    await supabase.from("workshops").update({ logo_url: url }).eq("id", user.id);
    setLogoUrl(url);
    setUploadingLogo(false);
    toast("Logo atualizada!");
  };

  const handleRemoveLogo = async () => {
    if (!user) return;
    const supabase = getSupabase();
    await supabase.from("workshops").update({ logo_url: null }).eq("id", user.id);
    setLogoUrl(null);
    toast("Logo removida.");
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const supabase = getSupabase();
    const { error } = await supabase.from("workshops").update({
      name: form.name,
      owner: form.owner,
      cnpj: form.cnpj,
      whatsapp: form.whatsapp,
      city: form.city,
      state: form.state,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast("Erro ao salvar. Tente novamente.", "error"); return; }
    toast("Perfil atualizado com sucesso!");
  };

  if (loading) {
    return <DashboardLayout title="Minha Oficina" subtitle=""><div className="animate-pulse h-4 bg-slate-200 rounded w-48" /></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Minha Oficina" subtitle="Gerencie as informações da sua oficina">
      <div className="max-w-2xl space-y-6">

        {/* Plano atual */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Plano atual</p>
              <p className="text-2xl font-bold mt-0.5">{planLabel[form.plan] ?? form.plan}</p>
              <p className="text-blue-200 text-xs mt-1">Para upgrade, entre em contato com o suporte</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${planColor[form.plan] ?? ""}`}>
              {planLabel[form.plan] ?? form.plan}
            </span>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-blue-600" /> Logo da Oficina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 flex-shrink-0 overflow-hidden">
                {logoUrl
                  ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  : <ImagePlus className="w-8 h-8 text-slate-300" />
                }
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Aparece no cabeçalho dos orçamentos em PDF.<br />PNG, JPG ou SVG · Máximo 2MB.</p>
                <div className="flex gap-2">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${uploadingLogo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 border-slate-200 text-slate-700"}`}>
                    <ImagePlus className="w-3.5 h-3.5" />
                    {uploadingLogo ? "Enviando..." : logoUrl ? "Trocar logo" : "Enviar logo"}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                  {logoUrl && (
                    <button onClick={handleRemoveLogo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
                      <X className="w-3.5 h-3.5" /> Remover
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Dados da Oficina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Nome da oficina *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="Auto Center Silva" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Nome do responsável</Label>
                  <Input placeholder="João Silva" value={form.owner} onChange={(e) => update("owner", e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label>CNPJ</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="email" value={form.email} disabled className="pl-9 bg-slate-50 text-slate-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400">E-mail não pode ser alterado</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select value={form.state} onValueChange={(v) => update("state", v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="gap-2" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Salvando...</div>
                  ) : (
                    <><Save className="w-4 h-4" />Salvar alterações</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações da conta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">E-mail</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plano</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColor[form.plan] ?? ""}`}>{planLabel[form.plan] ?? form.plan}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-400">Para alterar sua senha, use a opção &quot;Esqueci minha senha&quot; na tela de login.</p>
            </div>
          </CardContent>
        </Card>

        {/* Técnicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCog className="w-4 h-4 text-blue-600" /> Equipe de Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {technicians.length === 0 && (
                <p className="text-sm text-slate-400">Nenhum técnico cadastrado. Adicione para selecioná-los nas OS.</p>
              )}
              {technicians.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{t.name}</p>
                    {t.phone && <p className="text-xs text-slate-500">{t.phone}</p>}
                  </div>
                  <button onClick={async () => { try { await removeTech(t.id); toast("Técnico removido."); } catch { toast("Erro ao remover técnico.", "error"); } }} className="text-slate-400 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input placeholder="Nome do técnico *" value={newTechName} onChange={(e) => setNewTechName(e.target.value)} className="flex-1" />
              <Input placeholder="Telefone (opcional)" value={newTechPhone} onChange={(e) => setNewTechPhone(e.target.value)} className="w-36" />
              <Button
                onClick={async () => {
                  if (!newTechName.trim()) { toast("Nome obrigatório.", "warning"); return; }
                  try {
                    await createTech(newTechName.trim(), newTechPhone.trim() || undefined);
                    setNewTechName(""); setNewTechPhone("");
                    toast("Técnico adicionado!");
                  } catch {
                    toast("Erro ao adicionar técnico.", "error");
                  }
                }}
                className="gap-1 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
