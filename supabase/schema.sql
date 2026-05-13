-- ============================================================
-- Arthromed Customer Portal — Schema Additions
-- ============================================================

-- 1. Products Catalog
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  sku         text unique,
  description text,
  category    text,
  image_url   text,
  is_active   boolean default true,
  updated_at  timestamptz not null default now()
);

-- 2. Hospitals List
create table if not exists public.hospitals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  address     text,
  city        text,
  state       text,
  zip_code    text,
  updated_at  timestamptz not null default now()
);

-- 3. Base/Distributor Prices (Arthromed -> Distributor)
create table if not exists public.product_prices (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  client_id   uuid references public.clients(id) on delete cascade, -- Optional: if null, it's the global base price
  price       decimal(12,2) not null,
  currency    text default 'MXN',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(product_id, client_id)
);

-- 4. Hospital Prices (Distributor -> Hospital via Arthromed Agreements)
create table if not exists public.hospital_prices (
  id          uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  price       decimal(12,2) not null,
  currency    text default 'MXN',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(hospital_id, product_id)
);

-- 5. Distributor Letters (Authorized Status)
create table if not exists public.distributor_letters (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  issue_date      date not null default current_date,
  expiry_date     date,
  letter_url      text, -- URL to the generated PDF
  status          text default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at      timestamptz not null default now()
);

-- 6. Orders
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id),
  hospital_id     uuid references public.hospitals(id),
  status          text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount    decimal(12,2) not null,
  currency        text default 'MXN',
  notes           text,
  shipping_address text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 7. Order Items
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  unit_price  decimal(12,2) not null,
  total_price decimal(12,2) not null,
  created_at  timestamptz not null default now()
);

-- Triggers for updated_at
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_hospitals_updated_at before update on public.hospitals for each row execute function public.set_updated_at();
create trigger set_product_prices_updated_at before update on public.product_prices for each row execute function public.set_updated_at();
create trigger set_hospital_prices_updated_at before update on public.hospital_prices for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- RLS (Permissive for development, should be tightened later)
alter table public.products enable row level security;
alter table public.hospitals enable row level security;
alter table public.product_prices enable row level security;
alter table public.hospital_prices enable row level security;
alter table public.distributor_letters enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public access to products" on public.products for select using (true);
create policy "Public access to hospitals" on public.hospitals for select using (true);
create policy "Allow all prices" on public.product_prices for all using (true);
create policy "Allow all hospital prices" on public.hospital_prices for all using (true);
create policy "Allow all letters" on public.distributor_letters for all using (true);
create policy "Allow all orders" on public.orders for all using (true);
create policy "Allow all order items" on public.order_items for all using (true);
