-- SUPABASE_CLEANUP_TESTE.sql
-- Remove a conta de teste de QA criada durante a validação do fluxo.
-- Rode no SQL Editor do Supabase (precisa de acesso de admin/owner do projeto).
--
-- A conta: qa.teste.oficina+001@gmail.com (Oficina Teste QA)
-- Deletar o usuário do Auth remove em cascata workshop, clientes,
-- veículos, orçamentos e ordens de serviço vinculados (FK ON DELETE CASCADE).

-- 1. (Opcional) Conferir o que será removido antes de apagar:
-- SELECT id, email FROM auth.users WHERE email = 'qa.teste.oficina+001@gmail.com';

-- 2. Apagar a conta de teste (cascata remove todos os dados vinculados):
DELETE FROM auth.users
WHERE email = 'qa.teste.oficina+001@gmail.com';

-- 3. Caso alguma tabela NÃO tenha ON DELETE CASCADE, rode também (seguro mesmo se já vazias):
-- DELETE FROM service_orders WHERE workshop_id NOT IN (SELECT id FROM workshops);
-- DELETE FROM quotes         WHERE workshop_id NOT IN (SELECT id FROM workshops);
-- DELETE FROM vehicles       WHERE workshop_id NOT IN (SELECT id FROM workshops);
-- DELETE FROM customers      WHERE workshop_id NOT IN (SELECT id FROM workshops);
