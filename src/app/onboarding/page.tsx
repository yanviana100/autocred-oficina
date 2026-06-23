"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Check, Copy, ExternalLink, ChevronRight } from "lucide-react";
import { getSupabase, getWorkshopId } from "@/lib/db";

const serviceTypes = ["Revisão geral", "Troca de óleo", "Freios", "Suspensão", "Elétrica", "Ar-condicionado", "Alinhamento e balanceamento", "Funilaria", "Motor", "Câmbio", "Outro"];

function generateToken() {
  return crypto.randomUUID();
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-400 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function Shell({ children, step, total, onSkip }: {
  children: React.ReactNode;
  step: number;
  total: number;
  onSkip?: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">OficinaPro</span>
        </div>
        {onSkip && (
          <button onClick={onSkip} className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
            Pular configuração →
          </button>
        )}
      </header>
      <div className="px-6 max-w-xl mx-auto w-full mb-6">
        <ProgressBar step={step} total={total} />
      </div>
      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Input estilizado ─────────────────────────────────────────────────────────
function DarkInput({ label, placeholder, value, onChange, type = "text", autoFocus = false, hint }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; autoFocus?: boolean; hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function DarkSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base appearance-none"
      >
        <option value="" className="bg-slate-900">Selecione...</option>
        {options.map((o) => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-13 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base"
    >
      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — oficina
  const [workshopName, setWorkshopName] = useState("");
  const [workshopWhatsapp, setWorkshopWhatsapp] = useState("");
  const [workshopCity, setWorkshopCity] = useState("");

  // Step 2 — cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [customerId, setCustomerId] = useState("");

  // Step 3 — orçamento
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceValue, setServiceValue] = useState("");

  // Step 4 — sucesso
  const [publicToken, setPublicToken] = useState("");
  const [copied, setCopied] = useState(false);

  // Carrega dados já salvos da oficina
  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) { router.push("/auth/login"); return; }
      const supabase = getSupabase();
      const { data } = await supabase.from("workshops")
        .select("name, whatsapp, city, onboarding_completed")
        .eq("id", workshopId).single();
      if (data?.onboarding_completed) { router.push("/dashboard"); return; }
      if (data?.name) setWorkshopName(data.name);
      if (data?.whatsapp) setWorkshopWhatsapp(data.whatsapp);
      if (data?.city) setWorkshopCity(data.city);
    }
    load();
  }, [router]);

  const skip = () => router.push("/dashboard");

  // ── Step 1: salvar oficina ────────────────────────────────────────────────
  const handleSaveWorkshop = async () => {
    if (!workshopName.trim()) { setError("Nome da oficina é obrigatório."); return; }
    setLoading(true); setError("");
    const workshopId = await getWorkshopId();
    const supabase = getSupabase();
    await supabase.from("workshops").upsert({
      id: workshopId!,
      name: workshopName.trim(),
      whatsapp: workshopWhatsapp.trim() || null,
      city: workshopCity.trim() || null,
    }, { onConflict: "id" });
    setLoading(false);
    setStep(2);
  };

  // ── Step 2: criar cliente ─────────────────────────────────────────────────
  const handleCreateClient = async () => {
    if (!clientName.trim()) { setError("Nome do cliente é obrigatório."); return; }
    setLoading(true); setError("");
    const workshopId = await getWorkshopId();
    const supabase = getSupabase();
    const { data, error: err } = await supabase.from("customers").insert({
      workshop_id: workshopId,
      name: clientName.trim(),
      phone: clientPhone.trim() || null,
    }).select("id").single();
    setLoading(false);
    if (err || !data) { setError(`Erro: ${err?.message ?? "sem dados retornados"}`); return; }
    setCustomerId(data.id);
    setStep(3);
  };

  // ── Step 3: criar orçamento ───────────────────────────────────────────────
  const handleCreateQuote = async () => {
    if (!vehicleInfo.trim()) { setError("Informe o veículo."); return; }
    if (!serviceType) { setError("Selecione o tipo de serviço."); return; }
    if (!serviceValue || Number(serviceValue) <= 0) { setError("Informe o valor do serviço."); return; }
    setLoading(true); setError("");

    const workshopId = await getWorkshopId();
    const supabase = getSupabase();
    const token = generateToken();
    const value = Number(serviceValue);

    const { data: quote, error: qErr } = await supabase.from("quotes").insert({
      workshop_id: workshopId,
      customer_id: customerId,
      customer_name: clientName.trim(),
      vehicle_info: vehicleInfo.trim(),
      service_type: serviceType,
      problem_description: "",
      labor_cost: value,
      total_value: value,
      estimated_days: 1,
      status: "enviado",
      public_token: token,
    }).select("id").single();

    if (qErr || !quote) { setError("Erro ao criar orçamento."); setLoading(false); return; }

    await supabase.from("quote_items").insert({
      quote_id: quote.id,
      description: serviceType,
      type: "mao_de_obra",
      quantity: 1,
      unit_price: value,
      total: value,
    });

    await supabase.from("workshops").update({ onboarding_completed: true }).eq("id", workshopId!);

    setPublicToken(token);
    setLoading(false);
    setStep(4);
  };

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/orcamento/publico?token=${publicToken}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Renders ───────────────────────────────────────────────────────────────

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Ícone de sucesso */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/10">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Orçamento criado! 🎉</h1>
          <p className="text-slate-400 mb-2">
            O orçamento de <span className="text-white font-semibold">{clientName}</span> está pronto.
          </p>
          <p className="text-slate-500 text-sm mb-8">Mande o link abaixo para ele aprovar pelo celular.</p>

          {/* Link público */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-left">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Link do orçamento</p>
            <p className="text-blue-300 text-sm break-all mb-3 font-mono leading-relaxed">{publicUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copiado!" : "Copiar link"}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" /> Ver
              </a>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-8">
            O cliente abre o link, assina digitalmente e o orçamento volta aprovado para você automaticamente.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-base"
          >
            Ir para o sistema <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Shell
      step={step}
      total={3}
      onSkip={step < 4 ? skip : undefined}
    >
      {error && (
        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── STEP 1: Sua oficina ─────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <p className="text-blue-400 text-sm font-semibold mb-2 tracking-wide uppercase">Passo 1 de 3</p>
          <h1 className="text-3xl font-bold text-white mb-2">Sua oficina</h1>
          <p className="text-slate-400 mb-8">Essas informações aparecem nos orçamentos que você enviar para clientes.</p>

          <div className="space-y-4 mb-8">
            <DarkInput
              label="Nome da oficina *"
              placeholder="Auto Center Silva"
              value={workshopName}
              onChange={setWorkshopName}
              autoFocus
            />
            <DarkInput
              label="WhatsApp"
              placeholder="(11) 99999-9999"
              value={workshopWhatsapp}
              onChange={setWorkshopWhatsapp}
              hint="Aparece no orçamento para o cliente te chamar"
            />
            <DarkInput
              label="Cidade"
              placeholder="São Paulo"
              value={workshopCity}
              onChange={setWorkshopCity}
            />
          </div>

          <PrimaryBtn onClick={handleSaveWorkshop} loading={loading}>
            Continuar <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>
        </div>
      )}

      {/* ── STEP 2: Primeiro cliente ────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <p className="text-blue-400 text-sm font-semibold mb-2 tracking-wide uppercase">Passo 2 de 3</p>
          <h1 className="text-3xl font-bold text-white mb-2">Primeiro cliente</h1>
          <p className="text-slate-400 mb-8">
            Vamos criar um orçamento real agora. Pensa num cliente que está esperando orçamento — pode ser fictício também.
          </p>

          <div className="space-y-4 mb-8">
            <DarkInput
              label="Nome do cliente *"
              placeholder="João da Silva"
              value={clientName}
              onChange={setClientName}
              autoFocus
            />
            <DarkInput
              label="WhatsApp do cliente"
              placeholder="(11) 98888-7777"
              value={clientPhone}
              onChange={setClientPhone}
              hint="Para enviar o orçamento por mensagem"
            />
          </div>

          <PrimaryBtn onClick={handleCreateClient} loading={loading}>
            Continuar <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>

          <button onClick={() => setStep(1)} className="w-full text-center text-slate-600 hover:text-slate-400 text-sm mt-4 transition-colors">
            ← Voltar
          </button>
        </div>
      )}

      {/* ── STEP 3: Orçamento ───────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <p className="text-blue-400 text-sm font-semibold mb-2 tracking-wide uppercase">Passo 3 de 3</p>
          <h1 className="text-3xl font-bold text-white mb-1">Orçamento de {clientName.split(" ")[0]}</h1>
          <p className="text-slate-400 mb-8">Informe o veículo e o serviço. Em 30 segundos você terá um link para enviar.</p>

          <div className="space-y-4 mb-8">
            <DarkInput
              label="Veículo *"
              placeholder="Honda Civic 2020 — ABC-1D23"
              value={vehicleInfo}
              onChange={setVehicleInfo}
              autoFocus
              hint="Marca, modelo, ano e placa (em um campo só)"
            />
            <DarkSelect
              label="Tipo de serviço *"
              value={serviceType}
              onChange={setServiceType}
              options={serviceTypes}
            />
            <DarkInput
              label="Valor total (R$) *"
              placeholder="850"
              value={serviceValue}
              onChange={setServiceValue}
              type="number"
              hint="Pode ser estimativa — você edita depois"
            />
          </div>

          {serviceValue && Number(serviceValue) > 0 && (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total do orçamento</span>
              <span className="text-white font-bold text-2xl">
                R$ {Number(serviceValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <PrimaryBtn
            onClick={handleCreateQuote}
            loading={loading}
            disabled={!vehicleInfo.trim() || !serviceType || !serviceValue || Number(serviceValue) <= 0}
          >
            Criar orçamento e gerar link <ArrowRight className="w-5 h-5" />
          </PrimaryBtn>

          <button onClick={() => setStep(2)} className="w-full text-center text-slate-600 hover:text-slate-400 text-sm mt-4 transition-colors">
            ← Voltar
          </button>
        </div>
      )}
    </Shell>
  );
}
