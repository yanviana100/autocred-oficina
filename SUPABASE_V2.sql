-- AutoCred V2 Migration
-- Execute no Supabase SQL Editor

-- C5: KM entrada/saída + C3: Controle de pagamento + C2: OS avulsa
ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS km_entrada integer,
  ADD COLUMN IF NOT EXISTS km_saida integer,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pendente' CHECK (payment_status IN ('pendente','pago')),
  ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('dinheiro','pix','cartao_credito','cartao_debito','boleto','cheque')),
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_avulsa boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS problem_description text;

-- I2: Técnicos
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid REFERENCES workshops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "technicians_workshop" ON technicians;
CREATE POLICY "technicians_workshop" ON technicians
  USING (workshop_id = auth.uid())
  WITH CHECK (workshop_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_technicians_workshop_id ON technicians(workshop_id);
