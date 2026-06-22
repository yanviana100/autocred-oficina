-- SUPABASE_STORAGE.sql
-- Rode no SQL Editor do Supabase

-- 1. Criar bucket para logos das oficinas
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: oficina só pode fazer upload na própria pasta
CREATE POLICY "Upload logo própria"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Política: oficina pode atualizar/deletar própria logo
CREATE POLICY "Atualizar logo própria"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Deletar logo própria"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Leitura pública (para aparecer no PDF)
CREATE POLICY "Leitura pública logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- 5. Adicionar coluna logo_url na tabela workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS logo_url text;
