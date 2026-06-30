"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
    const { data: workshop } = await supabase.from("workshops").select("onboarding_completed").eq("id", data.user!.id).single();
    router.push(workshop?.onboarding_completed ? "/dashboard" : "/onboarding");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    });
    if (error) { setError("Erro ao enviar e-mail. Verifique o endereço."); setLoading(false); return; }
    setResetSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">OficinaPro</h1>
          <p className="text-slate-400 text-sm mt-1">{mode === "login" ? "Entre na sua conta" : "Recuperar senha"}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-medium">E-mail enviado!</p>
              <p className="text-slate-400 text-sm">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <button onClick={() => { setMode("login"); setResetSent(false); }} className="text-blue-400 text-sm hover:text-blue-300">
                Voltar ao login
              </button>
            </div>
          ) : mode === "login" ? (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input type="email" placeholder="sua@oficina.com.br" className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Senha</Label>
                    <button type="button" onClick={() => setMode("reset")} className="text-xs text-blue-400 hover:text-blue-300">
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Entrando...</div> : "Entrar"}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-6">
                Não tem conta?{" "}
                <Link href="/auth/cadastro" className="text-blue-400 hover:text-blue-300 font-medium">Cadastre sua oficina</Link>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleReset} className="space-y-5">
                <p className="text-sm text-slate-400">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input type="email" placeholder="sua@oficina.com.br" className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</div> : "Enviar link de recuperação"}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-6">
                <button onClick={() => setMode("login")} className="text-blue-400 hover:text-blue-300">Voltar ao login</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
