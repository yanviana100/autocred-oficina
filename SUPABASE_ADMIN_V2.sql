-- SUPABASE_ADMIN_V2.sql
-- Rode no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION get_workshop_detail(p_workshop_id uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_result json;
BEGIN
  SELECT is_admin INTO v_is_admin FROM workshops WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'workshop', (
      SELECT row_to_json(w) FROM (
        SELECT id, name, email, phone, address, plan, onboarding_completed, suspended_at, trial_ends_at, created_at
        FROM workshops WHERE id = p_workshop_id
      ) w
    ),
    'customers', (
      SELECT COALESCE(json_agg(row_to_json(c) ORDER BY c.created_at DESC), '[]')
      FROM (SELECT id, name, phone, email, cpf, created_at FROM customers WHERE workshop_id = p_workshop_id) c
    ),
    'vehicles', (
      SELECT COALESCE(json_agg(row_to_json(v) ORDER BY v.created_at DESC), '[]')
      FROM (SELECT id, plate, brand, model, year, mileage, color, created_at FROM vehicles WHERE workshop_id = p_workshop_id) v
    ),
    'service_orders', (
      SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.created_at DESC), '[]')
      FROM (SELECT id, number, status, total, created_at FROM service_orders WHERE workshop_id = p_workshop_id) s
    ),
    'quotes', (
      SELECT COALESCE(json_agg(row_to_json(q) ORDER BY q.created_at DESC), '[]')
      FROM (SELECT id, number, status, total, created_at FROM quotes WHERE workshop_id = p_workshop_id) q
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
