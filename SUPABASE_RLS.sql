-- ============================================================
-- POLÍTICAS RLS — rodar no SQL Editor do Supabase
-- Permite que cada oficina veja apenas seus próprios dados
-- ============================================================

-- CUSTOMERS
create policy "oficina vê seus clientes"
on customers for all
using (workshop_id = auth.uid())
with check (workshop_id = auth.uid());

-- VEHICLES
create policy "oficina vê seus veículos"
on vehicles for all
using (workshop_id = auth.uid())
with check (workshop_id = auth.uid());

-- QUOTES
create policy "oficina vê seus orçamentos"
on quotes for all
using (workshop_id = auth.uid())
with check (workshop_id = auth.uid());

-- QUOTE_ITEMS (herda via quote)
create policy "oficina vê itens dos seus orçamentos"
on quote_items for all
using (
  exists (
    select 1 from quotes
    where quotes.id = quote_items.quote_id
    and quotes.workshop_id = auth.uid()
  )
);

-- SERVICE_ORDERS
create policy "oficina vê suas ordens de serviço"
on service_orders for all
using (workshop_id = auth.uid())
with check (workshop_id = auth.uid());

-- FINANCING_REQUESTS
create policy "oficina vê suas solicitações de crédito"
on financing_requests for all
using (workshop_id = auth.uid())
with check (workshop_id = auth.uid());

-- WORKSHOPS (cada usuário vê/edita apenas sua própria oficina)
create policy "usuário vê sua oficina"
on workshops for all
using (id = auth.uid())
with check (id = auth.uid());

-- OS_COUNTER (todos podem ler e atualizar — controle sequencial global)
create policy "leitura do contador de OS"
on os_counter for select using (true);

create policy "atualização do contador de OS"
on os_counter for update using (true);
