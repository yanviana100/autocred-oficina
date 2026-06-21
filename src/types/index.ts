export type Plan = "starter" | "pro" | "premium";

export type QuoteStatus =
  | "rascunho"
  | "enviado"
  | "aguardando_aprovacao"
  | "aguardando_financiamento"
  | "pre_aprovado"
  | "aprovado"
  | "recusado"
  | "concluido";

export type FinancingStatus =
  | "novo"
  | "em_analise"
  | "documentos_pendentes"
  | "pre_aprovado"
  | "reprovado"
  | "convertido";

export type RiskLevel = "baixo" | "medio" | "alto" | "manual";

export interface Workshop {
  id: string;
  name: string;
  cnpj: string;
  owner: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  plan: Plan;
  createdAt: string;
  // extended profile fields
  monthlyVolume?: number;
  totalFinanced?: number;
  totalCommission?: number;
  approvalRate?: number;
  avgTicket?: number;
  activeRequests?: number;
}

export interface Customer {
  id: string;
  workshopId: string;
  name: string;
  cpf: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  chassis?: string;
  mileage: number;
  notes?: string;
  createdAt?: string;
}

export type ServiceOrderStatus =
  | "recebido"
  | "em_analise"
  | "em_execucao"
  | "aguardando_peca"
  | "finalizado"
  | "entregue";

export type PaymentStatus = "pendente" | "pago";
export type PaymentMethod = "dinheiro" | "pix" | "cartao_credito" | "cartao_debito" | "boleto" | "cheque";

export interface ServiceOrder {
  id: string;
  osNumber: string;
  workshopId: string;
  quoteId?: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: string;
  serviceType: string;
  problemDescription?: string;
  technicianName?: string;
  status: ServiceOrderStatus;
  entryDate: string;
  expectedDate?: string;
  completedDate?: string;
  totalValue: number;
  notes?: string;
  kmEntrada?: number;
  kmSaida?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  isAvulsa?: boolean;
  createdAt: string;
}

export interface Technician {
  id: string;
  workshopId: string;
  name: string;
  phone?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  type: "peca" | "mao_de_obra";
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  problemDescription: string;
  items: QuoteItem[];
  laborCost: number;
  totalValue: number;
  estimatedDays: number;
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
  publicToken: string;
}

export interface FinancingRequest {
  id: string;
  workshopId: string;
  customerId: string;
  quoteId: string;
  customerName: string;
  workshopName: string;
  serviceType: string;
  requestedAmount: number;
  installments: number;
  estimatedInstallment: number;
  status: FinancingStatus;
  riskLevel: RiskLevel;
  createdAt: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  monthlyIncome: number;
  profession: string;
  hasIncomeProof: boolean;
  hasCreditRestriction: "sim" | "nao" | "nao_sei";
  termsAccepted: boolean;
  // commission tracking
  shopCommission?: number;
  autocredCommission?: number;
  partnerName?: string;
}

export interface FinancingSimulation {
  id: string;
  quoteId: string;
  repairValue: number;
  downPayment: number;
  installments: number;
  interestRate: number;
  installmentValue: number;
  totalCost: number;
  shopCommission: number;
  autocredCommission: number;
  createdAt: string;
}

export interface FinancingPartner {
  id: string;
  name: string;
  logo: string;
  type: "banco" | "fintech" | "cooperativa";
  products: FinancingProduct[];
  monthlyCapacity: number;
  approvalRate: number;
  avgRate: number;
  minAmount: number;
  maxAmount: number;
  maxInstallments: number;
  active: boolean;
}

export interface FinancingProduct {
  name: string;
  minRate: number;
  maxRate: number;
  maxInstallments: number;
  minScore?: number;
  requiresProof: boolean;
  turnaroundHours: number;
}

export interface AdminMetrics {
  totalWorkshops: number;
  totalQuotes: number;
  totalFinancingRequested: number;
  totalLeads: number;
  conversionRate: number;
  mrr: number;
  commissionRevenue: number;
  approvalRate: number;
  avgTicket: number;
  workshopsByPlan: { starter: number; pro: number; premium: number };
}

export interface CreditFlowStep {
  id: number;
  label: string;
  description: string;
  status: "done" | "active" | "pending";
  time?: string;
}
