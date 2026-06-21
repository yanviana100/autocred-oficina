"use client";
import { use, useEffect, useState } from "react";
import { getSupabase, getWorkshopId } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import type { ServiceOrder } from "@/types";

const paymentLabels: Record<string, string> = {
  dinheiro: "Dinheiro", pix: "Pix", cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito", boleto: "Boleto", cheque: "Cheque",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Workshop { name: string; owner: string; cnpj: string; whatsapp: string; city: string; state: string; }

export default function ReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const workshopId = await getWorkshopId();
      if (!workshopId) return;
      const supabase = getSupabase();
      const [{ data: os }, { data: w }] = await Promise.all([
        supabase.from("service_orders").select("*").eq("id", id).single(),
        supabase.from("workshops").select("name,owner,cnpj,whatsapp,city,state").eq("id", workshopId).single(),
      ]);
      if (os) setOrder({
        id: os.id, osNumber: os.os_number ?? "", workshopId: os.workshop_id,
        quoteId: os.quote_id, customerId: os.customer_id, customerName: os.customer_name ?? "",
        vehicleId: os.vehicle_id, vehicleInfo: os.vehicle_info ?? "",
        serviceType: os.service_type ?? "", problemDescription: os.problem_description,
        technicianName: os.technician_name, status: os.status ?? "recebido",
        entryDate: os.entry_date ?? "", expectedDate: os.expected_date,
        completedDate: os.completed_date, totalValue: Number(os.total_value ?? 0),
        notes: os.notes, kmEntrada: os.km_entrada, kmSaida: os.km_saida,
        paymentStatus: os.payment_status ?? "pendente",
        paymentMethod: os.payment_method, paidAt: os.paid_at,
        isAvulsa: os.is_avulsa ?? false, createdAt: os.created_at?.split("T")[0] ?? "",
      });
      if (w) setWorkshop(w as Workshop);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!loading && order) setTimeout(() => window.print(), 300);
  }, [loading, order]);

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"#64748b" }}>Carregando...</div>;
  if (!order) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"#64748b" }}>Ordem não encontrada.</div>;

  const isPaid = order.paymentStatus === "pago";

  return (
    <>
      <style>{`
        @media print { @page { size: A4; margin: 15mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: white; margin: 0; } * { box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ position:"fixed", top:"16px", right:"16px", display:"flex", gap:"8px", zIndex:10 }}>
        <button onClick={() => window.print()} style={{ background:"#2563eb", color:"white", padding:"8px 20px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:600 }}>
          Imprimir / Salvar PDF
        </button>
        <button onClick={() => window.close()} style={{ background:"#f1f5f9", color:"#475569", padding:"8px 16px", borderRadius:"8px", border:"1px solid #e2e8f0", cursor:"pointer" }}>
          Fechar
        </button>
      </div>

      <div style={{ maxWidth:"780px", margin:"0 auto", padding:"24px" }}>

        {/* Cabeçalho */}
        <table style={{ width:"100%", marginBottom:"24px", borderBottom:`3px solid ${isPaid ? "#16a34a" : "#dc2626"}`, paddingBottom:"16px" }}>
          <tbody><tr>
            <td style={{ verticalAlign:"top" }}>
              <div style={{ fontSize:"22px", fontWeight:800, color:"#1e293b" }}>{workshop?.name ?? "Oficina"}</div>
              {workshop?.cnpj && <div style={{ fontSize:"11px", color:"#64748b" }}>CNPJ: {workshop.cnpj}</div>}
              {(workshop?.city || workshop?.state) && <div style={{ fontSize:"11px", color:"#64748b" }}>{workshop?.city}{workshop?.city && workshop?.state ? ", " : ""}{workshop?.state}</div>}
              {workshop?.whatsapp && <div style={{ fontSize:"11px", color:"#64748b" }}>Tel: {workshop.whatsapp}</div>}
            </td>
            <td style={{ textAlign:"right", verticalAlign:"top" }}>
              <div style={{ fontSize:"20px", fontWeight:700, color: isPaid ? "#16a34a" : "#dc2626" }}>
                {isPaid ? "RECIBO DE PAGAMENTO" : "COMPROVANTE DE SERVIÇO"}
              </div>
              <div style={{ fontSize:"13px", fontWeight:600, marginTop:"4px" }}>{order.osNumber}</div>
              <div style={{ fontSize:"11px", color:"#64748b" }}>Emitido em: {new Date().toLocaleDateString("pt-BR")}</div>
            </td>
          </tr></tbody>
        </table>

        {/* Status de pagamento */}
        <div style={{ background: isPaid ? "#f0fdf4" : "#fff7ed", border:`1px solid ${isPaid ? "#bbf7d0" : "#fed7aa"}`, borderRadius:"8px", padding:"14px 16px", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:"15px", color: isPaid ? "#15803d" : "#c2410c" }}>
              {isPaid ? "✓ PAGAMENTO CONFIRMADO" : "⚠ PAGAMENTO PENDENTE"}
            </div>
            {isPaid && order.paymentMethod && (
              <div style={{ fontSize:"12px", color:"#166534", marginTop:"2px" }}>
                Forma: {paymentLabels[order.paymentMethod]} · {formatDate(order.paidAt)}
              </div>
            )}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"24px", fontWeight:800, color: isPaid ? "#15803d" : "#c2410c" }}>{formatCurrency(order.totalValue)}</div>
          </div>
        </div>

        {/* Dados */}
        <table style={{ width:"100%", marginBottom:"20px", borderCollapse:"collapse" }}>
          <tbody><tr>
            <td style={{ width:"50%", verticalAlign:"top", paddingRight:"12px" }}>
              <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", padding:"12px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#64748b", textTransform:"uppercase", marginBottom:"6px" }}>CLIENTE</div>
                <div style={{ fontWeight:600 }}>{order.customerName}</div>
              </div>
            </td>
            <td style={{ width:"50%", verticalAlign:"top" }}>
              <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", padding:"12px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#64748b", textTransform:"uppercase", marginBottom:"6px" }}>VEÍCULO</div>
                <div style={{ fontWeight:600, fontSize:"13px" }}>{order.vehicleInfo}</div>
              </div>
            </td>
          </tr></tbody>
        </table>

        {/* Serviço */}
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:"20px" }}>
          <thead>
            <tr style={{ background:"#1e293b", color:"white" }}>
              <th style={{ padding:"8px 12px", textAlign:"left", fontSize:"11px" }}>SERVIÇO</th>
              <th style={{ padding:"8px 12px", textAlign:"left", fontSize:"11px" }}>DESCRIÇÃO</th>
              <th style={{ padding:"8px 12px", textAlign:"right", fontSize:"11px", width:"120px" }}>VALOR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding:"10px 12px", borderBottom:"1px solid #e2e8f0", fontWeight:600 }}>{order.serviceType}</td>
              <td style={{ padding:"10px 12px", borderBottom:"1px solid #e2e8f0", color:"#475569", fontSize:"12px" }}>{order.problemDescription ?? "—"}</td>
              <td style={{ padding:"10px 12px", borderBottom:"1px solid #e2e8f0", textAlign:"right", fontWeight:700, fontSize:"15px" }}>{formatCurrency(order.totalValue)}</td>
            </tr>
          </tbody>
        </table>

        {/* Detalhes */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"20px", fontSize:"12px" }}>
          {[
            ["Entrada", formatDate(order.entryDate)],
            ["Entrega", formatDate(order.completedDate ?? order.expectedDate)],
            ["Técnico", order.technicianName ?? "—"],
            ["KM Entrada", order.kmEntrada != null ? order.kmEntrada.toLocaleString("pt-BR") + " km" : "—"],
            ["KM Saída", order.kmSaida != null ? order.kmSaida.toLocaleString("pt-BR") + " km" : "—"],
            ["OS", order.osNumber],
          ].map(([label, value]) => (
            <div key={label} style={{ background:"#f8fafc", borderRadius:"6px", padding:"8px 10px" }}>
              <div style={{ color:"#64748b", fontSize:"10px", textTransform:"uppercase", marginBottom:"2px" }}>{label}</div>
              <div style={{ fontWeight:600 }}>{value}</div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div style={{ border:"1px solid #e2e8f0", borderRadius:"6px", padding:"10px 12px", marginBottom:"20px" }}>
            <div style={{ fontSize:"10px", fontWeight:700, color:"#64748b", textTransform:"uppercase", marginBottom:"4px" }}>OBSERVAÇÕES</div>
            <div style={{ color:"#374151", fontSize:"12px" }}>{order.notes}</div>
          </div>
        )}

        {/* Assinatura */}
        <table style={{ width:"100%", marginTop:"40px" }}>
          <tbody><tr>
            <td style={{ width:"45%", verticalAlign:"bottom" }}>
              <div style={{ borderTop:"1px solid #64748b", paddingTop:"6px", textAlign:"center", fontSize:"11px", color:"#64748b" }}>Assinatura do cliente</div>
              <div style={{ textAlign:"center", fontSize:"11px", color:"#64748b", marginTop:"2px" }}>{order.customerName}</div>
            </td>
            <td style={{ width:"10%" }} />
            <td style={{ width:"45%", verticalAlign:"bottom" }}>
              <div style={{ borderTop:"1px solid #64748b", paddingTop:"6px", textAlign:"center", fontSize:"11px", color:"#64748b" }}>Responsável pela oficina</div>
              <div style={{ textAlign:"center", fontSize:"11px", color:"#64748b", marginTop:"2px" }}>{workshop?.owner ?? ""}</div>
            </td>
          </tr></tbody>
        </table>

        <div style={{ marginTop:"28px", borderTop:"1px solid #e2e8f0", paddingTop:"10px", textAlign:"center", fontSize:"10px", color:"#94a3b8" }}>
          {workshop?.name} · {workshop?.city}{workshop?.state ? `, ${workshop.state}` : ""} · {workshop?.whatsapp}
        </div>
      </div>
    </>
  );
}
