"use client";
import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, ArrowRight, Eye, Share2 } from "lucide-react";
import { mockQuotes } from "@/data/mock";
import { formatCurrency, formatDate, quoteStatusLabel, quoteStatusColor } from "@/lib/utils";
import type { QuoteStatus } from "@/types";

export default function OrcamentosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filtered = mockQuotes.filter((q) => {
    const matchSearch =
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      q.vehicleInfo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((acc, q) => acc + q.totalValue, 0);

  return (
    <DashboardLayout title="Orçamentos" subtitle={`${filtered.length} orçamentos encontrados`}>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, serviço ou veículo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aguardando_aprovacao">Ag. Aprovação</SelectItem>
            <SelectItem value="aguardando_financiamento">Ag. Financiamento</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/orcamentos/novo">
          <Button className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" /> Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["rascunho", "enviado", "aguardando_financiamento", "concluido"] as QuoteStatus[]).map((status) => {
          const count = mockQuotes.filter((q) => q.status === status).length;
          return (
            <Card key={status} className="border-0 shadow-none bg-white">
              <CardContent className="p-4 text-center">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-2 ${quoteStatusColor[status]}`}>
                  {quoteStatusLabel[status]}
                </span>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">#</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Veículo</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Serviço</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Valor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Prazo</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((q, i) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{String(i + 1).padStart(3, "0")}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{q.customerName}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{q.vehicleInfo}</td>
                    <td className="px-4 py-3 text-slate-700">{q.serviceType}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(q.totalValue)}</td>
                    <td className="px-4 py-3 text-slate-500">{q.estimatedDays}d</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${quoteStatusColor[q.status]}`}>
                        {quoteStatusLabel[q.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/orcamentos/${q.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver orçamento">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/orcamento/publico?token=${q.publicToken}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Link do cliente">
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-medium text-slate-700">Total ({filtered.length} orçamentos)</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(totalValue)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
