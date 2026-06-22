"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, ClipboardList, Plus, Calendar, Clock,
} from "lucide-react";
import { getSupabase, getWorkshopId } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

interface AgendaOS {
  id: string;
  os_number: string;
  customer_name: string;
  vehicle_info: string;
  service_type: string;
  status: string;
  expected_date: string;
  total_value: number;
  technician_name: string;
}

const STATUS_LABEL: Record<string, string> = {
  recebido: "Recebido", em_analise: "Em análise", em_execucao: "Em execução",
  aguardando_peca: "Ag. peça", finalizado: "Finalizado", entregue: "Entregue",
};
const STATUS_COLOR: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-600 border-slate-200",
  em_analise: "bg-blue-100 text-blue-700 border-blue-200",
  em_execucao: "bg-violet-100 text-violet-700 border-violet-200",
  aguardando_peca: "bg-amber-100 text-amber-700 border-amber-200",
  finalizado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  entregue: "bg-green-100 text-green-700 border-green-200",
};
const STATUS_DOT: Record<string, string> = {
  recebido: "bg-slate-400", em_analise: "bg-blue-500", em_execucao: "bg-violet-500",
  aguardando_peca: "bg-amber-500", finalizado: "bg-emerald-500", entregue: "bg-green-500",
};

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function AgendaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [os, setOs] = useState<AgendaOS[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const workshopId = await getWorkshopId();
    if (!workshopId) { setLoading(false); return; }
    const supabase = getSupabase();

    // Busca OS com expected_date preenchida (últimos 3 meses + próximos 3 meses)
    const from = new Date(weekStart);
    from.setDate(from.getDate() - 90);
    const to = new Date(weekStart);
    to.setDate(to.getDate() + 90);

    const { data } = await supabase
      .from("service_orders")
      .select("id, number, customer_name, vehicle_info, service_type, status, expected_date, total_value, technician_name")
      .eq("workshop_id", workshopId)
      .not("expected_date", "is", null)
      .gte("expected_date", from.toISOString().split("T")[0])
      .lte("expected_date", to.toISOString().split("T")[0])
      .order("expected_date", { ascending: true });

    setOs((data ?? []).map((r) => ({
      id: r.id,
      os_number: r.number,
      customer_name: r.customer_name,
      vehicle_info: r.vehicle_info,
      service_type: r.service_type,
      status: r.status,
      expected_date: r.expected_date,
      total_value: r.total_value ?? 0,
      technician_name: r.technician_name ?? "",
    })));
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => setWeekStart(startOfWeek(new Date()));

  const getOsForDay = (day: Date) =>
    os.filter((o) => {
      const d = new Date(o.expected_date + "T00:00:00");
      return sameDay(d, day);
    });

  const totalWeek = weekDays.reduce((sum, d) => sum + getOsForDay(d).length, 0);

  return (
    <DashboardLayout title="Agenda" subtitle="Serviços programados por dia">
      <div className="space-y-4">

        {/* Header semana */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center min-w-[160px]">
              <p className="font-bold text-slate-900 text-sm">
                {weekDays[0].getDate()} – {weekDays[6].getDate()} de {MONTHS_PT[weekDays[6].getMonth()]} {weekDays[6].getFullYear()}
              </p>
              <p className="text-xs text-slate-400">{totalWeek} OS agendada{totalWeek !== 1 ? "s" : ""} na semana</p>
            </div>
            <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs">Hoje</Button>
            <Link href="/ordens/nova">
              <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-3.5 h-3.5" /> Nova OS
              </Button>
            </Link>
          </div>
        </div>

        {/* Grade semanal */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dayOs = getOsForDay(day);
            const isToday = sameDay(day, today);
            const isPast = day < today && !isToday;
            const isWeekend = i === 0 || i === 6;

            return (
              <div key={i} className={`rounded-xl border flex flex-col min-h-[120px] ${
                isToday
                  ? "border-blue-400 bg-blue-50"
                  : isWeekend
                    ? "border-slate-100 bg-slate-50/50"
                    : "border-slate-200 bg-white"
              }`}>
                {/* Cabeçalho do dia */}
                <div className={`px-3 py-2 border-b flex items-center justify-between ${
                  isToday ? "border-blue-200" : "border-slate-100"
                }`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${
                      isToday ? "text-blue-600" : isWeekend ? "text-slate-400" : "text-slate-500"
                    }`}>{DAYS_PT[day.getDay()]}</p>
                    <p className={`text-lg font-bold leading-tight ${
                      isToday ? "text-blue-700" : isPast ? "text-slate-300" : "text-slate-800"
                    }`}>{day.getDate()}</p>
                  </div>
                  {dayOs.length > 0 && (
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>{dayOs.length}</span>
                  )}
                </div>

                {/* OS do dia */}
                <div className="p-2 space-y-1.5 flex-1">
                  {loading ? (
                    <div className="h-8 bg-slate-100 rounded animate-pulse" />
                  ) : dayOs.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-3">—</p>
                  ) : dayOs.map((o) => (
                    <Link key={o.id} href={`/ordens/${o.id}`}>
                      <div className={`rounded-lg px-2.5 py-2 border cursor-pointer hover:shadow-sm transition-shadow ${STATUS_COLOR[o.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[o.status] ?? "bg-slate-400"}`} />
                          <p className="text-xs font-bold truncate">#{o.os_number}</p>
                        </div>
                        <p className="text-xs font-semibold truncate leading-tight">{o.customer_name}</p>
                        <p className="text-xs truncate opacity-70">{o.vehicle_info}</p>
                        {o.service_type && (
                          <p className="text-xs truncate opacity-60 mt-0.5">{o.service_type}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda + resumo */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[key]}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Info quando não tem OS com data */}
        {!loading && os.length === 0 && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <Calendar className="w-10 h-10 text-slate-300" />
              <div>
                <p className="font-semibold text-slate-600">Nenhuma OS agendada</p>
                <p className="text-sm text-slate-400 mt-1">
                  Ao criar uma OS, preencha a <strong>data prevista de conclusão</strong> para ela aparecer aqui.
                </p>
              </div>
              <Link href="/ordens/nova">
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-3.5 h-3.5" /> Criar primeira OS
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
