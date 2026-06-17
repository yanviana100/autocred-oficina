-- AutoCred Oficina — Schema Supabase
-- Execute este script no SQL Editor do Supabase

-- ========== EXTENSÕES ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== PLANOS ==========
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                        -- 'starter' | 'pro' | 'premium'
  display_name TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL,
  max_quotes INT,                            -- NULL = ilimitado
  max_customers INT,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO plans (name, display_name, monthly_price, max_quotes, max_customers, features) VALUES
  ('starter', 'Starter', 99.00, 30, 50, '["Dashboard básico","Orçamentos","Clientes"]'),
  ('pro', 'Pro', 249.00, NULL, NULL, '["Tudo do Starter","Pipeline financeiro","Simulador de financiamento","Link público do orçamento"]'),
  ('premium', 'Premium', 499.00, NULL, NULL, '["Tudo do Pro","API de integração","Relatórios avançados","Suporte prioritário"]');

-- ========== OFICINAS ==========
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT UNIQUE NOT NULL,
  city TEXT,
  state CHAR(2),
  address TEXT,
  plan_id UUID REFERENCES plans(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== USUÁRIOS (auth.users do Supabase) ==========
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'owner',              -- 'owner' | 'employee' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== ASSINATURAS ==========
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT DEFAULT 'active',           -- 'active' | 'cancelled' | 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== CLIENTES ==========
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state CHAR(2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== VEÍCULOS ==========
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  plate TEXT,
  mileage INT,
  color TEXT,
  chassis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== ORÇAMENTOS ==========
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  service_type TEXT NOT NULL,
  problem_description TEXT,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  total_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_days INT DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'rascunho',
  -- 'rascunho' | 'enviado' | 'aguardando_aprovacao' | 'aguardando_financiamento'
  -- | 'aprovado' | 'recusado' | 'concluido'
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== ITENS DO ORÇAMENTO ==========
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  item_type TEXT DEFAULT 'peca',          -- 'peca' | 'mao_de_obra'
  quantity NUMERIC(10,3) DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SIMULAÇÕES DE FINANCIAMENTO ==========
CREATE TABLE financing_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id),
  repair_value NUMERIC(10,2) NOT NULL,
  down_payment NUMERIC(10,2) DEFAULT 0,
  financed_amount NUMERIC(10,2) GENERATED ALWAYS AS (repair_value - down_payment) STORED,
  installments INT NOT NULL,
  monthly_rate NUMERIC(6,4) NOT NULL,
  installment_value NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SOLICITAÇÕES DE FINANCIAMENTO ==========
CREATE TABLE financing_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  quote_id UUID REFERENCES quotes(id),
  -- Dados pessoais (pré-análise)
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  monthly_income NUMERIC(10,2),
  profession TEXT,
  has_income_proof BOOLEAN,
  has_credit_restriction TEXT DEFAULT 'nao_sei', -- 'sim' | 'nao' | 'nao_sei'
  -- Dados da solicitação
  requested_amount NUMERIC(10,2) NOT NULL,
  installments INT NOT NULL,
  estimated_installment NUMERIC(10,2),
  -- Status e análise
  status TEXT DEFAULT 'novo',
  -- 'novo' | 'em_analise' | 'documentos_pendentes' | 'pre_aprovado' | 'reprovado' | 'convertido'
  risk_level TEXT,                        -- 'baixo' | 'medio' | 'alto' | 'manual'
  internal_notes TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== MÉTRICAS ADMIN ==========
CREATE TABLE admin_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period DATE NOT NULL,
  total_workshops INT DEFAULT 0,
  total_quotes INT DEFAULT 0,
  total_financing_requested NUMERIC(12,2) DEFAULT 0,
  total_leads INT DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  mrr NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== RLS (Row Level Security) ==========
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_simulations ENABLE ROW LEVEL SECURITY;

-- Políticas: cada oficina só vê seus próprios dados
CREATE POLICY "workshop_own_data" ON customers
  USING (workshop_id = (SELECT workshop_id FROM users WHERE id = auth.uid()));

CREATE POLICY "workshop_own_data" ON vehicles
  USING (workshop_id = (SELECT workshop_id FROM users WHERE id = auth.uid()));

CREATE POLICY "workshop_own_data" ON quotes
  USING (workshop_id = (SELECT workshop_id FROM users WHERE id = auth.uid()));

CREATE POLICY "workshop_own_data" ON financing_requests
  USING (workshop_id = (SELECT workshop_id FROM users WHERE id = auth.uid()));

-- Orçamento público (acesso por token sem autenticação)
CREATE POLICY "public_quote_by_token" ON quotes
  FOR SELECT USING (public_token IS NOT NULL);

-- ========== ÍNDICES ==========
CREATE INDEX idx_customers_workshop ON customers(workshop_id);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_quotes_workshop ON quotes(workshop_id);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_financing_workshop ON financing_requests(workshop_id);
CREATE INDEX idx_financing_status ON financing_requests(status);

-- ========== FUNÇÕES AUXILIARES ==========

-- Recalcula o total do orçamento automaticamente
CREATE OR REPLACE FUNCTION recalculate_quote_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes
  SET total_value = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM quote_items
    WHERE quote_id = NEW.quote_id
  ),
  updated_at = NOW()
  WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalc_quote_total
  AFTER INSERT OR UPDATE OR DELETE ON quote_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_quote_total();
