-- Índices de performance no workshop_id
-- Execute no Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_customers_workshop_id ON customers(workshop_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_workshop_id ON vehicles(workshop_id);
CREATE INDEX IF NOT EXISTS idx_quotes_workshop_id ON quotes(workshop_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_id ON quotes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_workshop_id ON service_orders(workshop_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_quote_id ON service_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_financing_requests_workshop_id ON financing_requests(workshop_id);
