-- SUPABASE_ADMIN.sql
-- Rode no SQL Editor do Supabase

-- 1. Adicionar colunas admin na tabela workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- 2. Marcar você como admin (substitua pelo seu e-mail se necessário)
UPDATE workshops SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'hc755vhg28@privaterelay.appleid.com' LIMIT 1
);

-- 3. Função para buscar todos os dados do admin (segura — verifica permissão internamente)
CREATE OR REPLACE FUNCTION get_admin_data()
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
    'total_workshops',        (SELECT COUNT(*) FROM workshops WHERE NOT COALESCE(is_admin, false)),
    'active_workshops',       (SELECT COUNT(*) FROM workshops WHERE suspended_at IS NULL AND onboarding_completed = true AND NOT COALESCE(is_admin, false)),
    'total_os',               (SELECT COUNT(*) FROM service_orders),
    'os_this_month',          (SELECT COUNT(*) FROM service_orders WHERE created_at >= date_trunc('month', now())),
    'total_customers',        (SELECT COUNT(*) FROM customers),
    'total_quotes',           (SELECT COUNT(*) FROM quotes),
    'workshops', (
      SELECT json_agg(
        json_build_object(
          'id',                  w.id,
          'name',                w.name,
          'email',               w.email,
          'plan',                w.plan,
          'suspended_at',        w.suspended_at,
          'onboarding_completed',w.onboarding_completed,
          'trial_ends_at',       w.trial_ends_at,
          'created_at',          w.created_at,
          'customer_count',      (SELECT COUNT(*) FROM customers c WHERE c.workshop_id = w.id),
          'os_count',            (SELECT COUNT(*) FROM service_orders s WHERE s.workshop_id = w.id),
          'os_this_month',       (SELECT COUNT(*) FROM service_orders s WHERE s.workshop_id = w.id AND s.created_at >= date_trunc('month', now())),
          'quote_count',         (SELECT COUNT(*) FROM quotes q WHERE q.workshop_id = w.id)
        )
        ORDER BY w.created_at DESC
      )
      FROM workshops w
      WHERE NOT COALESCE(w.is_admin, false)
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 4. Função para suspender / reativar uma oficina
CREATE OR REPLACE FUNCTION admin_toggle_suspend(p_workshop_id uuid, p_suspend boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_is_admin boolean;
BEGIN
  SELECT is_admin INTO v_is_admin FROM workshops WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE workshops
    SET suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END
    WHERE id = p_workshop_id;
END;
$$;

-- 5. Função para alterar plano de uma oficina
CREATE OR REPLACE FUNCTION admin_change_plan(p_workshop_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_is_admin boolean;
BEGIN
  SELECT is_admin INTO v_is_admin FROM workshops WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE workshops SET plan = p_plan WHERE id = p_workshop_id;
END;
$$;
