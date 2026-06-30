"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Mail, Lock, User, Phone, Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          workshop_name: form.name,
          owner_name: form.ownerName,
          whatsapp: form.whatsapp,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <CreditCard className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cadastro realizado!</h2>
          <p className="text-slate-400 text-sm">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">OficinaPro</h1>
          <p className="text-slate-400 text-sm mt-1">Cadastre sua oficina gratuitamente</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Nome da oficina *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Auto Center Silva"
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Seu nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="João Silva"
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">WhatsApp *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="(11) 99999-9999"
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="sua@oficina.com.br"
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-9 pr-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Confirmar senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : "Criar conta grátis"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Já tem conta?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Entrar
            </Link>
          </p>
          <p className="text-center text-xs text-slate-500 mt-4">
            Ao criar uma conta, você concorda com os{" "}
            <Link href="/termos" className="underline hover:text-slate-400">Termos de Uso</Link>
            {" "}e a{" "}
            <Link href="/privacidade" className="underline hover:text-slate-400">Política de Privacidade</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
