"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const estados = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    officeName: "", cnpj: "", ownerName: "", whatsapp: "", email: "", city: "", state: "", password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/dashboard");
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-xl">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AutoCred Oficina</h1>
          <p className="text-blue-300 text-sm mt-1">Cadastre sua oficina gratuitamente</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle>Dados da Oficina</CardTitle>
            <CardDescription>Preencha as informações para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Nome da Oficina *</Label>
                  <Input placeholder="Oficina Mecânica Silva" value={form.officeName} onChange={(e) => update("officeName", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>CNPJ *</Label>
                  <Input placeholder="00.000.000/0001-00" value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Nome do Responsável *</Label>
                  <Input placeholder="João Silva" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp *</Label>
                  <Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail *</Label>
                  <Input type="email" placeholder="contato@oficina.com.br" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Cidade *</Label>
                  <Input placeholder="São Paulo" value={form.city} onChange={(e) => update("city", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado *</Label>
                  <Select onValueChange={(v) => update("state", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Senha *</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                Ao se cadastrar, você concorda com nossos <a href="#" className="underline">Termos de Uso</a> e{" "}
                <a href="#" className="underline">Política de Privacidade</a>. O plano Starter (R$99/mês) será ativado após o período de avaliação.
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Criar conta gratuita <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Voltar para o login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
