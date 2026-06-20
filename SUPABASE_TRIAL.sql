-- 1. Adicionar coluna trial_ends_at na tabela workshops
alter table public.workshops
  add column if not exists trial_ends_at timestamptz;

-- 2. Atualizar o trigger para setar trial de 14 dias no cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.workshops (id, name, owner, email, whatsapp, plan, trial_ends_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'workshop_name', 'Minha Oficina'),
    coalesce(new.raw_user_meta_data->>'owner_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'whatsapp', ''),
    'starter',
    now() + interval '14 days'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Setar trial para as oficinas existentes que não têm trial (seus 20 clientes atuais)
-- Eles ganham 30 dias a partir de hoje
update public.workshops
set trial_ends_at = now() + interval '30 days'
where trial_ends_at is null;
