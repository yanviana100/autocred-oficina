"use client";
import { useState, useCallback, useEffect } from "react";
import { getSupabase, getWorkshopId } from "@/lib/db";
import type { Customer, Vehicle, Quote, QuoteItem, FinancingRequest, ServiceOrder, ServiceOrderStatus, PaymentMethod, Technician } from "@/types";

// ─── useCustomers ─────────────────────────────────────────────────────────────
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });
    setCustomers((data ?? []).map(dbToCustomer));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    customers,
    loading,
    create: async (data: Omit<Customer, "id" | "createdAt">) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      const { data: row, error } = await supabase.from("customers").insert({
        workshop_id: workshopId,
        name: data.name,
        cpf: data.cpf,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
      }).select().single();
      if (error) throw error;
      await refresh();
      return row ? dbToCustomer(row) : null;
    },
    update: async (id: string, data: Partial<Customer>) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("customers").update({
        name: data.name,
        cpf: data.cpf,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
      }).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    remove: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    get: async (id: string) => {
      const supabase = getSupabase();
      const { data } = await supabase.from("customers").select("*").eq("id", id).single();
      return data ? dbToCustomer(data) : null;
    },
  };
}

// ─── useVehicles ──────────────────────────────────────────────────────────────
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });
    setVehicles((data ?? []).map(dbToVehicle));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    vehicles,
    loading,
    byCustomer: (customerId: string) => vehicles.filter((v) => v.customerId === customerId),
    byPlate: (plate: string) => vehicles.find((v) => v.plate.toLowerCase() === plate.toLowerCase()),
    create: async (data: Omit<Vehicle, "id">) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      const { data: row, error } = await supabase.from("vehicles").insert({
        customer_id: data.customerId,
        workshop_id: workshopId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        color: data.color,
        chassis: data.chassis,
        mileage: data.mileage,
        notes: data.notes,
      }).select().single();
      if (error) throw error;
      await refresh();
      return row ? dbToVehicle(row) : null;
    },
    update: async (id: string, data: Partial<Vehicle>) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("vehicles").update({
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        color: data.color,
        chassis: data.chassis,
        mileage: data.mileage,
        notes: data.notes,
      }).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    remove: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    get: async (id: string) => {
      const supabase = getSupabase();
      const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
      return data ? dbToVehicle(data) : null;
    },
  };
}

// ─── useQuotes ────────────────────────────────────────────────────────────────
export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });
    setQuotes((data ?? []).map(dbToQuote));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    quotes,
    loading,
    byCustomer: (customerId: string) => quotes.filter((q) => q.customerId === customerId),
    get: async (id: string) => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", id)
        .single();
      return data ? dbToQuote(data) : null;
    },
    create: async (data: Omit<Quote, "id" | "createdAt">) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      const { data: row, error } = await supabase.from("quotes").insert({
        workshop_id: workshopId,
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        customer_name: data.customerName,
        vehicle_info: data.vehicleInfo,
        service_type: data.serviceType,
        problem_description: data.problemDescription,
        labor_cost: data.laborCost,
        total_value: data.totalValue,
        estimated_days: data.estimatedDays,
        notes: data.notes,
        status: data.status,
        public_token: data.publicToken,
      }).select().single();
      if (error) throw error;

      if (row && data.items?.length) {
        const { error: itemsError } = await supabase.from("quote_items").insert(
          data.items.map((item) => ({
            quote_id: row.id,
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          }))
        );
        if (itemsError) throw itemsError;
      }
      await refresh();
      return row ? { ...dbToQuote(row), items: data.items ?? [] } : null;
    },
    update: async (id: string, data: Partial<Quote> & { items?: Quote["items"] }) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("quotes").update({
        status: data.status,
        notes: data.notes,
        estimated_days: data.estimatedDays,
        total_value: data.totalValue,
        labor_cost: data.laborCost,
        service_type: data.serviceType,
        problem_description: data.problemDescription,
      }).eq("id", id);
      if (error) throw error;

      // Se veio lista de itens, substitui tudo
      if (data.items) {
        const { error: delError } = await supabase.from("quote_items").delete().eq("quote_id", id);
        if (delError) throw delError;
        if (data.items.length > 0) {
          const { error: insError } = await supabase.from("quote_items").insert(
            data.items.map((item) => ({
              quote_id: id,
              description: item.description,
              type: item.type,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total: item.total,
            }))
          );
          if (insError) throw insError;
        }
      }
      await refresh();
    },
    approve: async (id: string) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();

      const { error: updError } = await supabase.from("quotes").update({ status: "aprovado" }).eq("id", id);
      if (updError) throw updError;

      const { data: quote, error: fetchError } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      if (!quote) return null;

      const { data: counter } = await supabase
        .from("os_counter")
        .select("current_value")
        .eq("id", 1)
        .single();

      const nextVal = (counter?.current_value ?? 0) + 1;
      if (counter) {
        await supabase.from("os_counter").update({ current_value: nextVal }).eq("id", 1);
      } else {
        await supabase.from("os_counter").insert({ id: 1, current_value: nextVal });
      }
      const osNumber = `OS-${String(nextVal).padStart(4, "0")}`;

      const { data: os, error: osError } = await supabase.from("service_orders").insert({
        os_number: osNumber,
        workshop_id: workshopId,
        quote_id: id,
        customer_id: quote.customer_id,
        customer_name: quote.customer_name,
        vehicle_id: quote.vehicle_id,
        vehicle_info: quote.vehicle_info,
        service_type: quote.service_type,
        problem_description: quote.problem_description,
        status: "recebido",
        entry_date: new Date().toISOString().split("T")[0],
        total_value: quote.total_value,
        notes: quote.notes,
        payment_status: "pendente",
        is_avulsa: false,
      }).select().single();
      if (osError) throw osError;

      await refresh();
      return { quote: dbToQuote(quote), serviceOrder: os };
    },
    remove: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
  };
}

// ─── useServiceOrders ─────────────────────────────────────────────────────────
export function useServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("service_orders")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });
    setOrders((data ?? []).map(dbToServiceOrder));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    orders,
    loading,
    byCustomer: (customerId: string) => orders.filter((o) => o.customerId === customerId),
    byVehicle: (vehicleId: string) => orders.filter((o) => o.vehicleId === vehicleId),
    updateStatus: async (id: string, status: ServiceOrderStatus) => {
      const supabase = getSupabase();
      const updates: Record<string, unknown> = { status };
      if (status === "entregue") updates.completed_date = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("service_orders").update(updates).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    update: async (id: string, data: Partial<ServiceOrder>) => {
      const supabase = getSupabase();
      const payload: Record<string, unknown> = {};
      if (data.technicianName !== undefined) payload.technician_name = data.technicianName;
      if (data.status !== undefined) payload.status = data.status;
      if (data.expectedDate !== undefined) payload.expected_date = data.expectedDate;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.kmEntrada !== undefined) payload.km_entrada = data.kmEntrada;
      if (data.kmSaida !== undefined) payload.km_saida = data.kmSaida;
      if (data.totalValue !== undefined) payload.total_value = data.totalValue;
      const { error } = await supabase.from("service_orders").update(payload).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    markAsPaid: async (id: string, method: PaymentMethod) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("service_orders").update({
        payment_status: "pago",
        payment_method: method,
        paid_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    createAvulsa: async (data: {
      customerId: string;
      customerName: string;
      vehicleId: string;
      vehicleInfo: string;
      serviceType: string;
      problemDescription: string;
      technicianName?: string;
      totalValue: number;
      kmEntrada?: number;
      expectedDate?: string;
      notes?: string;
    }) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();

      const { data: counter } = await supabase
        .from("os_counter")
        .select("current_value")
        .eq("id", 1)
        .single();

      const nextVal = (counter?.current_value ?? 0) + 1;
      if (counter) {
        await supabase.from("os_counter").update({ current_value: nextVal }).eq("id", 1);
      } else {
        await supabase.from("os_counter").insert({ id: 1, current_value: nextVal });
      }
      const osNumber = `OS-${String(nextVal).padStart(4, "0")}`;

      const { data: row, error } = await supabase.from("service_orders").insert({
        os_number: osNumber,
        workshop_id: workshopId,
        customer_id: data.customerId,
        customer_name: data.customerName,
        vehicle_id: data.vehicleId,
        vehicle_info: data.vehicleInfo,
        service_type: data.serviceType,
        problem_description: data.problemDescription,
        technician_name: data.technicianName ?? null,
        status: "recebido",
        entry_date: new Date().toISOString().split("T")[0],
        expected_date: data.expectedDate ?? null,
        total_value: data.totalValue,
        km_entrada: data.kmEntrada ?? null,
        notes: data.notes ?? null,
        payment_status: "pendente",
        is_avulsa: true,
      }).select().single();
      if (error) throw error;

      await refresh();
      return row ? dbToServiceOrder(row) : null;
    },
    get: async (id: string) => {
      const supabase = getSupabase();
      const { data } = await supabase.from("service_orders").select("*").eq("id", id).single();
      return data ? dbToServiceOrder(data) : null;
    },
  };
}

// ─── useTechnicians ───────────────────────────────────────────────────────────
export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("technicians")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("name");
    setTechnicians((data ?? []).map((r) => ({
      id: r.id,
      workshopId: r.workshop_id,
      name: r.name ?? "",
      phone: r.phone,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    technicians,
    loading,
    create: async (name: string, phone?: string) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      const { error } = await supabase.from("technicians").insert({ workshop_id: workshopId, name, phone: phone ?? null });
      if (error) throw error;
      await refresh();
    },
    remove: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("technicians").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
  };
}

// ─── useFinancingRequests ──────────────────────────────────────────────────────
export function useFinancingRequests() {
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const { data } = await supabase
      .from("financing_requests")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });
    setRequests((data ?? []).map(dbToFinancingRequest));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    requests,
    loading,
    byCustomer: (customerId: string) => requests.filter((r) => r.customerId === customerId),
    create: async (data: Omit<FinancingRequest, "id" | "createdAt">) => {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      const { data: row } = await supabase.from("financing_requests").insert({
        workshop_id: workshopId,
        customer_id: data.customerId || null,
        quote_id: data.quoteId || null,
        customer_name: data.customerName,
        service_type: data.serviceType,
        requested_amount: data.requestedAmount,
        installments: data.installments,
        estimated_installment: data.estimatedInstallment,
        status: data.status,
        risk_level: data.riskLevel,
        full_name: data.fullName,
        cpf: data.cpf,
        birth_date: data.birthDate || null,
        monthly_income: data.monthlyIncome,
        profession: data.profession,
        has_income_proof: data.hasIncomeProof,
        has_credit_restriction: data.hasCreditRestriction,
        terms_accepted: data.termsAccepted,
        shop_commission: data.shopCommission,
        autocred_commission: data.autocredCommission,
        partner_name: data.partnerName,
      }).select().single();
      await refresh();
      return row ? dbToFinancingRequest(row) : null;
    },
    update: async (id: string, data: Partial<FinancingRequest>) => {
      const supabase = getSupabase();
      await supabase.from("financing_requests").update({ status: data.status }).eq("id", id);
      await refresh();
    },
    remove: async (id: string) => {
      const supabase = getSupabase();
      await supabase.from("financing_requests").delete().eq("id", id);
      await refresh();
    },
  };
}

// ─── useDashboardMetrics ──────────────────────────────────────────────────────
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    quotesThisMonth: 0,
    openOrders: 0,
    completedOrders: 0,
    avgTicket: 0,
    revenueGenerated: 0,
  });

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const workshopId = await getWorkshopId();
      if (!workshopId) return;

      const [
        { count: totalCustomers },
        { count: totalVehicles },
        { data: quotes },
        { data: orders },
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("workshop_id", workshopId),
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("workshop_id", workshopId),
        supabase.from("quotes").select("status, total_value, created_at").eq("workshop_id", workshopId),
        supabase.from("service_orders").select("status, total_value, payment_status").eq("workshop_id", workshopId),
      ]);

      const now = new Date();
      const quotesThisMonth = (quotes ?? []).filter((q) => {
        const d = new Date(q.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const openOrders = (orders ?? []).filter((o) => !["finalizado", "entregue"].includes(o.status)).length;
      const completedOrders = (orders ?? []).filter((o) => ["finalizado", "entregue"].includes(o.status)).length;
      const approvedQuotes = (quotes ?? []).filter((q) => ["aprovado", "concluido"].includes(q.status));
      const avgTicket = approvedQuotes.length
        ? approvedQuotes.reduce((s, q) => s + q.total_value, 0) / approvedQuotes.length
        : 0;
      const revenueGenerated = (orders ?? [])
        .filter((o) => o.payment_status === "pago")
        .reduce((s: number, o: Record<string, unknown>) => s + Number(o.total_value ?? 0), 0);

      setMetrics({
        totalCustomers: totalCustomers ?? 0,
        totalVehicles: totalVehicles ?? 0,
        quotesThisMonth,
        openOrders,
        completedOrders,
        avgTicket,
        revenueGenerated,
      });
    }
    load();
  }, []);

  return metrics;
}

// ─── Mappers DB → App ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToCustomer(row: any): Customer {
  return {
    id: row.id,
    workshopId: row.workshop_id,
    name: row.name,
    cpf: row.cpf ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    createdAt: row.created_at?.split("T")[0] ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToVehicle(row: any): Vehicle {
  return {
    id: row.id,
    customerId: row.customer_id,
    brand: row.brand ?? "",
    model: row.model ?? "",
    year: row.year ?? 0,
    plate: row.plate ?? "",
    color: row.color,
    chassis: row.chassis,
    mileage: row.mileage ?? 0,
    notes: row.notes,
    createdAt: row.created_at?.split("T")[0],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToQuote(row: any): Quote {
  return {
    id: row.id,
    workshopId: row.workshop_id,
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    customerName: row.customer_name ?? "",
    vehicleInfo: row.vehicle_info ?? "",
    serviceType: row.service_type ?? "",
    problemDescription: row.problem_description ?? "",
    laborCost: row.labor_cost ?? 0,
    totalValue: row.total_value ?? 0,
    estimatedDays: row.estimated_days ?? 1,
    notes: row.notes,
    status: row.status ?? "rascunho",
    publicToken: row.public_token ?? "",
    createdAt: row.created_at?.split("T")[0] ?? "",
    signedBy: row.signed_by ?? null,
    signedAt: row.signed_at ?? null,
    items: (row.quote_items ?? []).map(dbToQuoteItem),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToQuoteItem(row: any): QuoteItem {
  return {
    id: row.id,
    quoteId: row.quote_id,
    description: row.description ?? "",
    type: row.type ?? "peca",
    quantity: row.quantity ?? 1,
    unitPrice: row.unit_price ?? 0,
    total: row.total ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToServiceOrder(row: any): ServiceOrder {
  return {
    id: row.id,
    osNumber: row.os_number ?? "",
    workshopId: row.workshop_id,
    quoteId: row.quote_id,
    customerId: row.customer_id,
    customerName: row.customer_name ?? "",
    vehicleId: row.vehicle_id,
    vehicleInfo: row.vehicle_info ?? "",
    serviceType: row.service_type ?? "",
    problemDescription: row.problem_description,
    technicianName: row.technician_name,
    status: row.status ?? "recebido",
    entryDate: row.entry_date ?? "",
    expectedDate: row.expected_date,
    completedDate: row.completed_date,
    totalValue: row.total_value ?? 0,
    notes: row.notes,
    kmEntrada: row.km_entrada,
    kmSaida: row.km_saida,
    paymentStatus: row.payment_status ?? "pendente",
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
    isAvulsa: row.is_avulsa ?? false,
    createdAt: row.created_at?.split("T")[0] ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToFinancingRequest(row: any): FinancingRequest {
  return {
    id: row.id,
    workshopId: row.workshop_id,
    customerId: row.customer_id ?? "",
    quoteId: row.quote_id ?? "",
    customerName: row.customer_name ?? "",
    workshopName: "",
    serviceType: row.service_type ?? "",
    requestedAmount: row.requested_amount ?? 0,
    installments: row.installments ?? 12,
    estimatedInstallment: row.estimated_installment ?? 0,
    status: row.status ?? "novo",
    riskLevel: row.risk_level ?? "medio",
    fullName: row.full_name ?? "",
    cpf: row.cpf ?? "",
    birthDate: row.birth_date ?? "",
    monthlyIncome: row.monthly_income ?? 0,
    profession: row.profession ?? "",
    hasIncomeProof: row.has_income_proof ?? false,
    hasCreditRestriction: row.has_credit_restriction ?? "nao",
    termsAccepted: row.terms_accepted ?? false,
    shopCommission: row.shop_commission,
    autocredCommission: row.autocred_commission,
    partnerName: row.partner_name,
    createdAt: row.created_at?.split("T")[0] ?? "",
  };
}
