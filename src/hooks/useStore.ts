"use client";
import { useState, useCallback, useEffect } from "react";
import { createStore, nextOsNumber } from "@/lib/store";
import {
  mockCustomers, mockVehicles, mockQuotes, mockFinancingRequests,
} from "@/data/mock";
import type { Customer, Vehicle, Quote, ServiceOrder, ServiceOrderStatus } from "@/types";

// ─── Stores singleton (inicializam com seed na primeira vez) ─────────────────
const customerStore = createStore<Customer>("ac_customers", "c", mockCustomers);
const vehicleStore  = createStore<Vehicle>("ac_vehicles",  "v", mockVehicles);
const quoteStore    = createStore<Quote>("ac_quotes",      "q", mockQuotes);
const osStore       = createStore<ServiceOrder>("ac_orders", "os");

// ─── useCustomers ─────────────────────────────────────────────────────────────
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const refresh = useCallback(() => setCustomers(customerStore.list()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    customers,
    create: (data: Omit<Customer, "id" | "createdAt">) => {
      const c = customerStore.create({ ...data, workshopId: "w1" });
      refresh();
      return c;
    },
    update: (id: string, data: Partial<Customer>) => {
      const c = customerStore.update(id, data);
      refresh();
      return c;
    },
    remove: (id: string) => {
      customerStore.remove(id);
      refresh();
    },
    get: (id: string) => customerStore.get(id),
  };
}

// ─── useVehicles ──────────────────────────────────────────────────────────────
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const refresh = useCallback(() => setVehicles(vehicleStore.list()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    vehicles,
    byCustomer: (customerId: string) => vehicleStore.list().filter((v) => v.customerId === customerId),
    create: (data: Omit<Vehicle, "id">) => {
      const v = vehicleStore.create(data);
      refresh();
      return v;
    },
    update: (id: string, data: Partial<Vehicle>) => {
      const v = vehicleStore.update(id, data);
      refresh();
      return v;
    },
    remove: (id: string) => {
      vehicleStore.remove(id);
      refresh();
    },
    get: (id: string) => vehicleStore.get(id),
  };
}

// ─── useQuotes ────────────────────────────────────────────────────────────────
export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const refresh = useCallback(() => setQuotes(quoteStore.list()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    quotes,
    byCustomer: (customerId: string) => quoteStore.list().filter((q) => q.customerId === customerId),
    create: (data: Omit<Quote, "id" | "createdAt">) => {
      const q = quoteStore.create(data);
      refresh();
      return q;
    },
    update: (id: string, data: Partial<Quote>) => {
      const q = quoteStore.update(id, data);
      refresh();
      return q;
    },
    approve: (id: string) => {
      // Muda status do orçamento para aprovado e cria OS automaticamente
      const q = quoteStore.update(id, { status: "aprovado" });
      if (!q) return null;

      const vehicle = vehicleStore.get(q.vehicleId);
      const os = osStore.create({
        osNumber: nextOsNumber(),
        workshopId: q.workshopId,
        quoteId: q.id,
        customerId: q.customerId,
        customerName: q.customerName,
        vehicleId: q.vehicleId,
        vehicleInfo: q.vehicleInfo,
        serviceType: q.serviceType,
        status: "recebido" as ServiceOrderStatus,
        entryDate: new Date().toISOString().split("T")[0],
        totalValue: q.totalValue,
        notes: q.notes,
        createdAt: new Date().toISOString().split("T")[0],
      });
      refresh();
      return { quote: q, serviceOrder: os };
    },
    remove: (id: string) => {
      quoteStore.remove(id);
      refresh();
    },
    get: (id: string) => quoteStore.get(id),
  };
}

// ─── useServiceOrders ─────────────────────────────────────────────────────────
export function useServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const refresh = useCallback(() => setOrders(osStore.list()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    orders,
    byCustomer: (customerId: string) => osStore.list().filter((o) => o.customerId === customerId),
    updateStatus: (id: string, status: ServiceOrderStatus) => {
      const updates: Partial<ServiceOrder> = { status };
      if (status === "entregue") updates.completedDate = new Date().toISOString().split("T")[0];
      const o = osStore.update(id, updates);
      refresh();
      return o;
    },
    update: (id: string, data: Partial<ServiceOrder>) => {
      const o = osStore.update(id, data);
      refresh();
      return o;
    },
    get: (id: string) => osStore.get(id),
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
    const customers = customerStore.list();
    const vehicles  = vehicleStore.list();
    const quotes    = quoteStore.list();
    const orders    = osStore.list();

    const now = new Date();
    const thisMonth = quotes.filter((q) => {
      const d = new Date(q.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const openOrders = orders.filter((o) => !["finalizado", "entregue"].includes(o.status));
    const completedOrders = orders.filter((o) => ["finalizado", "entregue"].includes(o.status));
    const approvedQuotes = quotes.filter((q) => ["aprovado", "concluido"].includes(q.status));
    const revenueGenerated = completedOrders.reduce((s, o) => s + o.totalValue, 0);
    const avgTicket = approvedQuotes.length
      ? approvedQuotes.reduce((s, q) => s + q.totalValue, 0) / approvedQuotes.length
      : 0;

    setMetrics({
      totalCustomers: customers.length,
      totalVehicles: vehicles.length,
      quotesThisMonth: thisMonth.length,
      openOrders: openOrders.length,
      completedOrders: completedOrders.length,
      avgTicket,
      revenueGenerated,
    });
  }, []);

  return metrics;
}
