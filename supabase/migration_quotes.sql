-- 10. Quotes
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  status          text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  total_amount    decimal(12,2) not null default 0,
  currency        text default 'MXN',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;
create policy "Allow all quotes" on public.quotes for all using (true);

-- 11. Quote Items
create table if not exists public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  unit_price  decimal(12,2) not null,
  total_price decimal(12,2) not null,
  created_at  timestamptz not null default now()
);

alter table public.quote_items enable row level security;
create policy "Allow all quote items" on public.quote_items for all using (true);

-- 12. Factura Receipts
create table if not exists public.factura_receipts (
  id          uuid primary key default gen_random_uuid(),
  factura_id  text not null,
  receipt_url text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.factura_receipts enable row level security;
create policy "Allow all factura receipts" on public.factura_receipts for all using (true);
