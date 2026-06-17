"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { User, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { mockFinancingRequests } from "@/data/mock";
import { formatCurrency, formatDate, financingStatusLabel, financingStatusColor, riskLevelColor, riskLevelLabel } from "@/lib/utils";
import type { FinancingStatus, FinancingRequest } from "@/types";

const COLUMNS: { id: FinancingStatus; color: string; headerColor: string }[] = [
  { id: "novo", color: "bg-slate-50", headerColor: "bg-slate-200 text-slate-700" },
  { id: "em_analise", color: "bg-blue-50", headerColor: "bg-blue-200 text-blue-700" },
  { id: "documentos_pendentes", color: "bg-yellow-50", headerColor: "bg-yellow-200 text-yellow-700" },
  { id: "pre_aprovado", color: "bg-green-50", headerColor: "bg-green-200 text-green-700" },
  { id: "reprovado", color: "bg-red-50", headerColor: "bg-red-200 text-red-700" },
  { id: "convertido", color: "bg-emerald-50", headerColor: "bg-emerald-200 text-emerald-700" },
];

function KanbanCard({ item }: { item: FinancingRequest }) {
  return (
    <div className="kanban-card bg-white rounded-xl shadow-sm border border-slate-100 p-4 cursor-grab active:cursor-grabbing">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900 truncate">{item.customerName}</p>
          <p className="text-xs text-slate-500 truncate">{item.serviceType}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Solicitado
          </span>
          <span className="font-bold text-slate-900">{formatCurrency(item.requestedAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Parcela est.</span>
          <span className="font-medium text-slate-700">{item.installments}x {formatCurrency(item.estimatedInstallment)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data
          </span>
          <span className="text-slate-600">{formatDate(item.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${riskLevelColor[item.riskLevel]}`}>
          {riskLevelLabel[item.riskLevel]}
        </span>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [requests, setRequests] = useState(mockFinancingRequests);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<FinancingStatus | null>(null);

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const handleDrop = (status: FinancingStatus) => {
    if (!dragging) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === dragging ? { ...r, status } : r))
    );
    setDragging(null);
    setDragOver(null);
  };

  const totalValue = requests.reduce((acc, r) => acc + r.requestedAmount, 0);
  const convertedValue = requests.filter((r) => r.status === "convertido").reduce((acc, r) => acc + r.requestedAmount, 0);

  return (
    <DashboardLayout title="Pipeline Financeiro" subtitle="Arraste os cards para mover entre etapas">
      {/* Summary */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total em análise</p>
            <p className="font-bold text-slate-900">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Convertidos</p>
            <p className="font-bold text-slate-900">{formatCurrency(convertedValue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div>
            <p className="text-xs text-slate-500">Total de leads</p>
            <p className="font-bold text-slate-900">{requests.length}</p>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colItems = requests.filter((r) => r.status === col.id);
            const colTotal = colItems.reduce((acc, r) => acc + r.requestedAmount, 0);

            return (
              <div
                key={col.id}
                className={`w-72 rounded-xl ${col.color} transition-all ${dragOver === col.id ? "ring-2 ring-blue-400" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                onDrop={() => handleDrop(col.id)}
                onDragLeave={() => setDragOver(null)}
              >
                {/* Column header */}
                <div className={`rounded-t-xl px-4 py-3 ${col.headerColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{financingStatusLabel[col.id]}</span>
                      <span className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-xs font-bold">
                        {colItems.length}
                      </span>
                    </div>
                    {colTotal > 0 && (
                      <span className="text-xs font-medium opacity-80">{formatCurrency(colTotal)}</span>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 min-h-48">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-opacity ${dragging === item.id ? "opacity-50" : ""}`}
                    >
                      <KanbanCard item={item} />
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                      Arraste cards aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
