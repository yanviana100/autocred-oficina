-- SUPABASE_FIX.sql
-- Rode no SQL Editor do Supabase para corrigir problemas encontrados

-- 1. Garante que os_counter tem a linha inicial (necessária para criar OS)
INSERT INTO os_counter (id, current_value)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Verifica se existe alguma OS com os_number nulo (bug antigo) e corrige
UPDATE service_orders
SET os_number = 'OS-' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 4, '0')
WHERE os_number IS NULL OR os_number = '';
