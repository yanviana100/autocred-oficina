"use client";
import { use, useEffect, useState } from "react";
import { getSupabase, getWorkshopId } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import type { Quote } from "@/types";

interface Workshop {
  name: string;
  owner: string;
  cnpj: string;
  whatsapp: string;
  city: string;
  state: string;
  logo_url: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function ImprimirOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();

      const [{ data: qData }, { data: wData }] = await Promise.all([
        supabase.from("quotes").select("*, quote_items(*)").eq("id", id).single(),
        supabase.from("workshops").select("name,owner,cnpj,whatsapp,city,state,logo_url").eq("id", workshopId).single(),
      ]);

      if (qData) {
        setQuote({
          id: qData.id,
          workshopId: qData.workshop_id,
          customerId: qData.customer_id,
          vehicleId: qData.vehicle_id,
          customerName: qData.customer_name,
          vehicleInfo: qData.vehicle_info,
          serviceType: qData.service_type,
          problemDescription: qData.problem_description,
          items: (qData.quote_items ?? []).map((i: Record<string, unknown>) => ({
            id: String(i.id),
            quoteId: String(i.quote_id),
            description: String(i.description),
            type: String(i.type) as "peca" | "mao_de_obra",
            quantity: Number(i.quantity),
            unitPrice: Number(i.unit_price),
            total: Number(i.total),
          })),
          laborCost: Number(qData.labor_cost ?? 0),
          totalValue: Number(qData.total_value ?? 0),
          estimatedDays: Number(qData.estimated_days ?? 1),
          notes: qData.notes,
          status: qData.status,
          createdAt: qData.created_at,
          publicToken: qData.public_token,
        });
      }

      if (wData) setWorkshop(wData as Workshop);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!loading && quote) {
      setTimeout(() => window.print(), 300);
    }
  }, [loading, quote]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Carregando orçamento...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Orçamento não encontrado.
      </div>
    );
  }

  const pecas = quote.items.filter((i) => i.type === "peca");
  const maoDeObra = quote.items.filter((i) => i.type === "mao_de_obra");
  const totalPecas = pecas.reduce((s, i) => s + i.total, 0);
  const totalMaoDeObra = maoDeObra.reduce((s, i) => s + i.total, 0);

  const quoteNumber = `ORC-${quote.id.slice(-6).toUpperCase()}`;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: white; margin: 0; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Botão imprimir — some no print */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => window.print()}
          style={{ background: "#2563eb", color: "white", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          Imprimir / Salvar PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{ background: "#f1f5f9", color: "#475569", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", cursor: "pointer" }}
        >
          Fechar
        </button>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "24px" }}>

        {/* Cabeçalho */}
        <table style={{ width: "100%", marginBottom: "24px", borderBottom: "2px solid #2563eb", paddingBottom: "16px" }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top" }}>
                {workshop?.logo_url ? (
                  <img src={workshop.logo_url} alt="Logo" style={{ height: "56px", maxWidth: "180px", objectFit: "contain", marginBottom: "6px", display: "block" }} />
                ) : (
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b" }}>{workshop?.name ?? "Oficina"}</div>
                )}
                {workshop?.logo_url && <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{workshop.name}</div>}
                {workshop?.cnpj && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>CNPJ: {workshop.cnpj}</div>}
                {(workshop?.city || workshop?.state) && (
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{workshop.city}{workshop.city && workshop.state ? ", " : ""}{workshop.state}</div>
                )}
                {workshop?.whatsapp && <div style={{ fontSize: "11px", color: "#64748b" }}>Tel: {workshop.whatsapp}</div>}
              </td>
              <td style={{ textAlign: "right", verticalAlign: "top" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#2563eb" }}>ORÇAMENTO</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", marginTop: "4px" }}>{quoteNumber}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Data: {formatDate(quote.createdAt)}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Prazo: {quote.estimatedDays} dia{quote.estimatedDays !== 1 ? "s" : ""} útei{quote.estimatedDays !== 1 ? "s" : "l"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cliente e Veículo */}
        <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top", paddingRight: "16px" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>CLIENTE</div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{quote.customerName}</div>
                </div>
              </td>
              <td style={{ width: "50%", verticalAlign: "top" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>VEÍCULO</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{quote.vehicleInfo}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Serviço e problema */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "12px", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
            SERVIÇO: {quote.serviceType}
          </div>
          <div style={{ color: "#374151", lineHeight: "1.5" }}>{quote.problemDescription}</div>
        </div>

        {/* Itens */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
          <thead>
            <tr style={{ background: "#1e293b", color: "white" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", fontWeight: 600 }}>DESCRIÇÃO</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "11px", fontWeight: 600, width: "80px" }}>TIPO</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "11px", fontWeight: 600, width: "50px" }}>QTD</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "11px", fontWeight: 600, width: "100px" }}>UNIT.</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "11px", fontWeight: 600, width: "110px" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>{item.description}</td>
                <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{
                    background: item.type === "peca" ? "#dbeafe" : "#fff7ed",
                    color: item.type === "peca" ? "#1d4ed8" : "#c2410c",
                    padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                  }}>
                    {item.type === "peca" ? "Peça" : "M.O."}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>{item.quantity}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ padding: "8px 12px", textAlign: "right", color: "#475569", fontSize: "12px", borderTop: "1px solid #cbd5e1" }}>Subtotal peças</td>
              <td style={{ padding: "8px 12px", textAlign: "right", borderTop: "1px solid #cbd5e1" }}>{formatCurrency(totalPecas)}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: "4px 12px", textAlign: "right", color: "#475569", fontSize: "12px" }}>Subtotal mão de obra</td>
              <td style={{ padding: "4px 12px", textAlign: "right" }}>{formatCurrency(totalMaoDeObra)}</td>
            </tr>
            <tr style={{ background: "#1e293b", color: "white" }}>
              <td colSpan={4} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, fontSize: "14px" }}>TOTAL</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, fontSize: "15px" }}>{formatCurrency(quote.totalValue)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Observações */}
        {quote.notes && (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px 12px", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>OBSERVAÇÕES</div>
            <div style={{ color: "#374151", fontSize: "12px" }}>{quote.notes}</div>
          </div>
        )}

        {/* Assinatura */}
        <table style={{ width: "100%", marginTop: "40px", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "45%", verticalAlign: "bottom" }}>
                <div style={{ borderTop: "1px solid #64748b", paddingTop: "6px", textAlign: "center", fontSize: "11px", color: "#64748b" }}>
                  Assinatura do cliente
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{quote.customerName}</div>
              </td>
              <td style={{ width: "10%" }} />
              <td style={{ width: "45%", verticalAlign: "bottom" }}>
                <div style={{ borderTop: "1px solid #64748b", paddingTop: "6px", textAlign: "center", fontSize: "11px", color: "#64748b" }}>
                  Responsável pela oficina
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{workshop?.owner ?? ""}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Rodapé */}
        <div style={{ marginTop: "32px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
          Orçamento gerado em {formatDate(quote.createdAt)} · {workshop?.name} · {workshop?.city}{workshop?.state ? `, ${workshop.state}` : ""}
          {" · Orçamento válido por 7 dias"}
        </div>

        {/* Co-branding */}
        <div style={{ marginTop: "10px", textAlign: "center", fontSize: "9px", color: "#cbd5e1" }}>
          Gerado por <span style={{ fontWeight: 600, color: "#94a3b8" }}>OficinaPro</span> · Sistema de gestão para oficinas mecânicas · oficinaPro.com.br
        </div>
      </div>
    </>
  );
}
