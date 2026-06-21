"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { CreditCard, Check, ArrowRight, User, Car, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const marcas = ["Toyota","Honda","Volkswagen","Chevrolet","Ford","Hyundai","Fiat","Renault","Nissan","Jeep","Mitsubishi","Kia","Outras"];

const TEMPLATES = [
  { name: "Troca de óleo", price: 80 },
  { name: "Filtro de óleo", price: 35 },
  { name: "Alinhamento", price: 120 },
  { name: "Balanceamento", price: 80 },
  { name: "Revisão geral", price: 200 },
  { name: "Troca de pastilha de freio", price: 150 },
];

const STEPS = [
  { label: "Boas-vindas", icon: CreditCard },
  { label: "Cliente", icon: User },
  { label: "Veículo", icon: Car },
  { label: "Orçamento", icon: FileText },
];

function StepDot({ n, current }: { n: number; current: number }) {
  const done = n < current;
  const active = n === current;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
      ${done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-100 text-slate-400"}`}>
      {done ? <Check className="w-4 h-4" /> : n}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workshopName, setWorkshopName] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2 — cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [customerId, setCustomerId] = useState("");

  // Step 3 — veículo
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  // Step 4 — orçamento
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");

  const years = Array.from({ length: 37 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      supabase.from("workshops").select("name, onboarding_completed").eq("id", user.id).single().then(({ data }) => {
        if (data?.onboarding_completed) { router.push("/dashboard"); return; }
        setWorkshopName(data?.name ?? "");
      });
    });
  }, [router]);

  const toggleTemplate = (i: number) => {
    setSelectedTemplates((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const totalAmount = selectedTemplates.reduce((sum, i) => sum + TEMPLATES[i].price, 0)
    + (customService && customPrice ? Number(customPrice) : 0);

  // --- Handlers ---

  const handleCreateCustomer = async () => {
    if (!clientName.trim()) { setError("Nome do cliente é obrigatório."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.from("customers").insert({
      workshop_id: userId,
      name: clientName.trim(),
      phone: clientPhone.trim() || null,
    }).select("id").single();
    setLoading(false);
    if (err) { setError("Erro ao salvar cliente. Tente novamente."); return; }
    setCustomerId(data.id);
    setStep(3);
  };

  const handleCreateVehicle = async () => {
    if (!plate.trim() || !brand || !model.trim() || !year) { setError("Preencha placa, marca, modelo e ano."); return; }
    if (!mileage || Number(mileage) < 0) { setError("Informe a quilometragem."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.from("vehicles").insert({
      workshop_id: userId,
      customer_id: customerId,
      plate: plate.trim().toUpperCase(),
      brand,
      model: model.trim(),
      year: Number(year),
      mileage: Number(mileage),
    }).select("id").single();
    setLoading(false);
    if (err) { setError("Erro ao salvar veículo. Tente novamente."); return; }
    setVehicleId(data.id);
    setStep(4);
  };

  const handleCreateQuote = async () => {
    const items: { description: string; quantity: number; unit_price: number; total: number }[] = [];
    selectedTemplates.forEach((i) => {
      items.push({ description: TEMPLATES[i].name, quantity: 1, unit_price: TEMPLATES[i].price, total: TEMPLATES[i].price });
    });
    if (customService.trim() && customPrice) {
      items.push({ description: customService.trim(), quantity: 1, unit_price: Number(customPrice), total: Number(customPrice) });
    }
    if (items.length === 0) { setError("Adicione pelo menos um serviço."); return; }

    setLoading(true); setError("");

    // get next quote number
    const { data: counter } = await supabase.rpc("increment_os_counter", { p_workshop_id: userId }).single();
    const seq = (counter as number | null) ?? 1;
    const quoteNumber = `ORC-${String(seq).padStart(4, "0")}`;

    const description = items.map((i) => i.description).join(", ");
    const { data: quote, error: qErr } = await supabase.from("quotes").insert({
      workshop_id: userId,
      customer_id: customerId,
      vehicle_id: vehicleId,
      quote_number: quoteNumber,
      service_type: "revisao",
      description,
      total_amount: totalAmount,
      status: "rascunho",
      notes: notes.trim() || null,
    }).select("id").single();

    if (qErr) { setError("Erro ao criar orçamento."); setLoading(false); return; }

    await supabase.from("quote_items").insert(
      items.map((it, idx) => ({
        quote_id: quote.id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total: it.total,
        order_index: idx,
      }))
    );

    await supabase.from("workshops").update({ onboarding_completed: true }).eq("id", userId);

    setLoading(false);
    setStep(5);
  };

  // --- Render ---

  const progressPct = Math.round(((step - 1) / 4) * 100);

  if (step === 5) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tudo pronto! 🎉</h1>
          <p className="text-slate-400 mb-2">Seu primeiro orçamento foi criado.</p>
          <p className="text-slate-400 text-sm mb-8">
            <span className="text-emerald-400 font-semibold">{clientName}</span> ·{" "}
            <span className="text-blue-400 font-semibold">{plate.toUpperCase()}</span> ·{" "}
            <span className="text-white font-semibold">R$ {totalAmount.toFixed(2).replace(".", ",")}</span>
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold" onClick={() => router.push("/dashboard")}>
            Ir para o dashboard <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <p className="text-slate-500 text-xs mt-4">Você pode enviar o orçamento pelo WhatsApp direto do sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-3">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-sm">AutoCred Oficina</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-800">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Steps indicator */}
          {step > 1 && step < 5 && (
            <div className="flex items-center justify-between px-6 pt-5 pb-1">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <StepDot n={i + 1} current={step} />
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-8 sm:w-16 ${i + 1 < step ? "bg-emerald-500" : "bg-slate-700"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{error}</div>
            )}

            {/* STEP 1 — Boas-vindas */}
            {step === 1 && (
              <div className="text-center py-4">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Bem-vindo{workshopName ? `, ${workshopName}` : ""}! 👋
                </h1>
                <p className="text-slate-400 mb-8">
                  Vamos criar seu primeiro orçamento em menos de <span className="text-blue-400 font-semibold">10 minutos</span>.
                </p>
                <div className="space-y-3 text-left mb-8">
                  {[
                    { n: 1, label: "Cadastrar um cliente", sub: "Nome e telefone" },
                    { n: 2, label: "Cadastrar o veículo", sub: "Placa, marca e modelo" },
                    { n: 3, label: "Criar o orçamento", sub: "Serviços e valores" },
                  ].map((item) => (
                    <div key={item.n} className="flex items-center gap-4 bg-slate-800/60 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                        {item.n}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-slate-500 text-xs">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700" onClick={() => setStep(2)}>
                  Começar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button onClick={() => router.push("/dashboard")} className="text-slate-500 text-sm mt-4 hover:text-slate-400 block w-full text-center">
                  Pular — configurar depois
                </button>
              </div>
            )}

            {/* STEP 2 — Cliente */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Primeiro cliente</h2>
                <p className="text-slate-400 text-sm mb-6">Nome e WhatsApp para enviar o orçamento</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Nome completo *</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
                      placeholder="Carlos Eduardo Mendes"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">WhatsApp</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
                      placeholder="(11) 98888-7777"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-11" onClick={handleCreateCustomer} disabled={loading}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Próximo <ArrowRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 — Veículo */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Veículo de {clientName.split(" ")[0]}</h2>
                <p className="text-slate-400 text-sm mb-6">Placa, marca e modelo para identificar o carro</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Placa *</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11 uppercase tracking-widest font-mono text-center text-lg"
                      placeholder="ABC-1D23"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      maxLength={8}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Marca *</Label>
                      <Select value={brand} onValueChange={setBrand}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-11">
                          <SelectValue placeholder="Marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {marcas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Modelo *</Label>
                      <Input
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
                        placeholder="Gol, Civic..."
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Ano *</Label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-11">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">KM atual *</Label>
                      <Input
                        type="number"
                        min={0}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-11"
                        placeholder="45000"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-11" onClick={handleCreateVehicle} disabled={loading}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Próximo <ArrowRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4 — Orçamento */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Primeiro orçamento</h2>
                <p className="text-slate-400 text-sm mb-5">Selecione os serviços ou adicione um personalizado</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => toggleTemplate(i)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTemplates.includes(i)
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <div className="text-xs font-medium leading-snug">{t.name}</div>
                      <div className={`text-xs mt-1 font-bold ${selectedTemplates.includes(i) ? "text-blue-400" : "text-slate-500"}`}>
                        R$ {t.price}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-700/50 pt-4 mb-4">
                  <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wide">Serviço personalizado</p>
                  <div className="flex gap-2">
                    <Input
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 flex-1 text-sm"
                      placeholder="Descrição do serviço"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                    />
                    <Input
                      type="number"
                      min={0}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 w-24 text-sm"
                      placeholder="R$ valor"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  <Label className="text-slate-300 text-sm">Observação (opcional)</Label>
                  <Input
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 text-sm"
                    placeholder="Ex: aguardando peça do fornecedor"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {totalAmount > 0 && (
                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 mb-5 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total do orçamento</span>
                    <span className="text-white font-bold text-lg">R$ {totalAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setStep(3)}>
                    Voltar
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11 font-semibold" onClick={handleCreateQuote} disabled={loading || totalAmount === 0}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Criar orçamento ✓</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          {step > 1 ? `Passo ${step - 1} de 3` : "Configuração inicial"} · AutoCred Oficina
        </p>
      </div>
    </div>
  );
}
