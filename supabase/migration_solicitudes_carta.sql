-- Create solicitudes_carta_distribucion table
create table if not exists public.solicitudes_carta_distribucion (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  client_id         uuid not null references public.clientes(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  lineas_producto   text[] not null,
  estados           text[] not null,
  hospital          text not null,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- Enable RLS
alter table public.solicitudes_carta_distribucion enable row level security;

-- Policies
create policy "Allow all solicitudes" 
  on public.solicitudes_carta_distribucion 
  for all 
  using (true);

-- Trigger for updated_at
drop trigger if exists set_solicitudes_carta_distribucion_updated_at on public.solicitudes_carta_distribucion;
create trigger set_solicitudes_carta_distribucion_updated_at 
  before update on public.solicitudes_carta_distribucion 
  for each row 
  execute function public.set_updated_at();
