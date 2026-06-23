-- SUPABASE_ASSINATURA.sql
-- Cole no SQL Editor do Supabase

-- 1. Adicionar colunas de assinatura na tabela quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signed_by text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signed_at timestamptz;

-- 2. Função pública para o cliente assinar o orçamento pelo token
-- SECURITY DEFINER permite execução sem autenticação via token público
CREATE OR REPLACE FUNCTION sign_quote_by_token(p_token text, p_signed_by text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote quotes%ROWTYPE;
BEGIN
  SELECT * INTO v_quote FROM quotes WHERE public_token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'not_found');
  END IF;

  IF v_quote.status IN ('aprovado', 'concluido') THEN
    RETURN json_build_object('error', 'already_approved');
  END IF;

  IF v_quote.signed_at IS NOT NULL THEN
    RETURN json_build_object('error', 'already_signed');
  END IF;

  UPDATE quotes
  SET
    status = 'aguardando_aprovacao',
    signed_by = trim(p_signed_by),
    signed_at = now()
  WHERE public_token = p_token;

  RETURN json_build_object('success', true);
END;
$$;

-- 3. Permitir execução pelo usuário anônimo (página pública sem login)
GRANT EXECUTE ON FUNCTION sign_quote_by_token(text, text) TO anon;
