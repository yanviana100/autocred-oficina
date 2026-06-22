"use client";
import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, DollarSign, ClipboardList, Users, Wrench, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSupabase, getWorkshopId } from "@/lib/db";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const COLORS = ["#2563eb","#16a34a","#d97706","#dc2626","#7c3aed","#0891b2"];

interface MonthlyData { mes: string; faturamento: number; os: number; }
interface ServiceData { name: string; value: number; }
interface CustomerData { name: string; total: number; }
interface OsStatusData { name: string; value: number; }

export default function RelatoriosPage() {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [faturamentoMesAnterior, setFaturamentoMesAnterior] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [totalOS, setTotalOS] = useState(0);
  const [orcamentosAprovados, setOrcamentosAprovados] = useState(0);
  const [orcamentosTotal, setOrcamentosTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topServicos, setTopServicos] = useState<ServiceData[]>([]);
  const [topClientes, setTopClientes] = useState<CustomerData[]>([]);
  const [osStatus, setOsStatus] = useState<OsStatusData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawOrdens, setRawOrdens] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const workshopId = await getWorkshopId();
    if (!workshopId) return;
    const supabase = getSupabase();
    const mesAtual = now.getMonth();
    const anoAtual = now.getFullYear();

    // OS filtradas pelo período
    const { data: ordens } = await supabase
      .from("service_orders")
      .select("*")
      .eq("workshop_id", workshopId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo + "T23:59:59");

    // OS do mês anterior (para variação — sempre fixo)
    const { data: ordensAnterior } = await supabase
      .from("service_orders")
      .select("total_value, created_at")
      .eq("workshop_id", workshopId);

    // Orçamentos
    const { data: orcamentos } = await supabase
      .from("quotes")
      .select("*")
      .eq("workshop_id", workshopId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo + "T23:59:59");

    setRawOrdens(ordens ?? []);

      if (ordens) {
        const ossMesAnterior = (ordensAnterior ?? []).filter((o) => {
          const d = new Date(o.created_at);
          const mesAnt = mesAtual === 0 ? 11 : mesAtual - 1;
          const anoAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
          return d.getMonth() === mesAnt && d.getFullYear() === anoAnt;
        });

        const fatAtual = ordens.reduce((s: number, o: Record<string,unknown>) => s + Number(o.total_value ?? 0), 0);
        const fatAnterior = ossMesAnterior.reduce((s: number, o: Record<string,unknown>) => s + Number(o.total_value ?? 0), 0);
        setFaturamentoMes(fatAtual);
        setFaturamentoMesAnterior(fatAnterior);
        setTotalOS(ordens.length);
        setTicketMedio(ordens.length > 0 ? ordens.reduce((s: number, o: Record<string,unknown>) => s + Number(o.total_value ?? 0), 0) / ordens.length : 0);

        // Status das OS
        const statusMap: Record<string, number> = {};
        const statusLabel: Record<string, string> = {
          recebido: "Recebido",
          em_analise: "Em análise",
          em_execucao: "Em execução",
          aguardando_peca: "Aguard. peça",
          finalizado: "Finalizado",
          entregue: "Entregue",
        };
        ordens.forEach((o: Record<string,unknown>) => {
          const s = String(o.status ?? "recebido");
          statusMap[s] = (statusMap[s] ?? 0) + 1;
        });
        setOsStatus(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabel[k] ?? k, value: v })));

        // Top serviços
        const servicoMap: Record<string, number> = {};
        ordens.forEach((o: Record<string,unknown>) => {
          const s = String(o.service_type ?? "Outros");
          servicoMap[s] = (servicoMap[s] ?? 0) + 1;
        });
        setTopServicos(
          Object.entries(servicoMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }))
        );

        // Top clientes
        const clienteMap: Record<string, number> = {};
        ordens.forEach((o: Record<string,unknown>) => {
          const name = String(o.customer_name ?? "");
          if (name) clienteMap[name] = (clienteMap[name] ?? 0) + Number(o.total_value ?? 0);
        });
        setTopClientes(
          Object.entries(clienteMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, total]) => ({ name, total }))
        );

        // Faturamento últimos 6 meses
        const monthly: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const m = (mesAtual - i + 12) % 12;
          const y = anoAtual - (mesAtual - i < 0 ? 1 : 0);
          const ossDoMes = ordens.filter((o: Record<string,unknown>) => {
            const d = new Date(String(o.created_at));
            return d.getMonth() === m && d.getFullYear() === y;
          });
          monthly.push({
            mes: MESES[m],
            faturamento: ossDoMes.reduce((s: number, o: Record<string,unknown>) => s + Number(o.total_value ?? 0), 0),
            os: ossDoMes.length,
          });
        }
        setMonthlyData(monthly);
      }

      if (orcamentos) {
        setOrcamentosTotal(orcamentos.length);
        setOrcamentosAprovados(orcamentos.filter((o: Record<string,unknown>) => ["aprovado","concluido"].includes(String(o.status))).length);
      }

      setLoading(false);
  }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const variacaoFaturamento = faturamentoMesAnterior > 0
    ? ((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100
    : 0;
  const taxaConversao = orcamentosTotal > 0 ? (orcamentosAprovados / orcamentosTotal) * 100 : 0;

  const exportCSV = () => {
    const payLabel: Record<string, string> = { dinheiro: "Dinheiro", pix: "Pix", cartao_credito: "Cartão Crédito", cartao_debito: "Cartão Débito", boleto: "Boleto", cheque: "Cheque" };
    const header = ["OS", "Cliente", "Veículo", "Serviço", "Valor", "Status", "Pagamento", "Forma Pagamento", "Entrada"];
    const rows = rawOrdens.map((o) => [
      o.os_number ?? "", o.customer_name ?? "", o.vehicle_info ?? "", o.service_type ?? "",
      String(o.total_value ?? 0), o.status ?? "", o.payment_status ?? "",
      payLabel[o.payment_method ?? ""] ?? "", (o.entry_date ?? "").slice(0, 10),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `os_${dateFrom}_${dateTo}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout title="Relatórios" subtitle="Acompanhe o desempenho da sua oficina">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="animate-pulse h-16 bg-slate-100 rounded" /></CardContent></Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Relatórios" subtitle="Acompanhe o desempenho da sua oficina">
      <div className="space-y-6">

        {/* Filtros de período */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-sm font-medium text-slate-700">Período:</span>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-sm w-36" />
            <span className="text-slate-400 text-sm">até</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <div className="flex gap-2">
            {[["Este mês", firstOfMonth, today], ["Este ano", `${now.getFullYear()}-01-01`, today], ["Tudo", "2020-01-01", today]].map(([label, from, to]) => (
              <button key={label} onClick={() => { setDateFrom(from); setDateTo(to); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${dateFrom === from && dateTo === to ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1 ml-auto" onClick={exportCSV} disabled={rawOrdens.length === 0}>
            <Download className="w-3.5 h-3.5" />Exportar CSV
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Faturamento do mês</p>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(faturamentoMes)}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${variacaoFaturamento >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {variacaoFaturamento >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(variacaoFaturamento).toFixed(1)}% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Ticket médio</p>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(ticketMedio)}</p>
              <p className="text-xs text-slate-400 mt-1">por ordem de serviço</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Total de OS</p>
                <ClipboardList className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalOS}</p>
              <p className="text-xs text-slate-400 mt-1">ordens registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Conversão de orç.</p>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{taxaConversao.toFixed(0)}%</p>
              <p className="text-xs text-slate-400 mt-1">{orcamentosAprovados} de {orcamentosTotal} aprovados</p>
            </CardContent>
          </Card>
        </div>

        {/* Faturamento últimos 6 meses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faturamento — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.every((d) => d.faturamento === 0) ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Nenhuma OS registrada ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="faturamento" fill="#2563eb" radius={[4, 4, 0, 0]} name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" /> Top 5 serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topServicos.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Nenhum dado ainda</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={topServicos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                      {topServicos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status das OS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-violet-600" /> Status das OS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {osStatus.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Nenhuma OS ainda</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={osStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {osStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Top 5 clientes por faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClientes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">Nenhum dado ainda</div>
            ) : (
              <div className="space-y-3">
                {topClientes.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate">{c.name}</span>
                        <span className="text-sm font-bold text-slate-900 ml-2">{formatCurrency(c.total)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(c.total / topClientes[0].total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
