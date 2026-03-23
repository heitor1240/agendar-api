-- =============================================
-- BARBERPRO — SCHEMA SUPABASE
-- Execute TODO este arquivo no SQL Editor do Supabase
-- Se já executou antes: rode o DROP TABLE abaixo primeiro
-- =============================================

drop table if exists public.appointments cascade;
drop table if exists public.barber_services cascade;
drop table if exists public.services cascade;
drop table if exists public.barbers cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user cascade;

-- =============================================
-- PROFILES
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  phone text default '',
  role text not null default 'client' check (role in ('admin','barber','client')),
  barber_id bigint default null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Permissão total para todos"
  on public.profiles for all using (true) with check (true);

-- =============================================
-- BARBERS
-- =============================================
create table public.barbers (
  id bigserial primary key,
  name text not null,
  role text not null default 'Barber',
  bio text default '',
  email text default '',
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.barbers enable row level security;

create policy "Permissão total para todos"
  on public.barbers for all using (true) with check (true);

-- =============================================
-- SERVICES
-- =============================================
create table public.services (
  id bigserial primary key,
  name text not null,
  description text default '',
  price numeric(10,2) not null,
  duration integer not null default 30,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.services enable row level security;

create policy "Permissão total para todos"
  on public.services for all using (true) with check (true);

-- =============================================
-- APPOINTMENTS
-- =============================================
create table public.appointments (
  id bigserial primary key,
  barber_id bigint references public.barbers(id),
  service_id bigint references public.services(id),
  client_name text not null,
  client_email text not null,
  client_phone text default '',
  date date not null,
  time time not null,
  status text not null default 'confirmed' check (status in ('confirmed','pending','cancelled','done')),
  notes text default '',
  service_price numeric(10,2) not null,
  service_name text not null,
  barber_name text not null,
  created_at timestamptz default now()
);
alter table public.appointments enable row level security;

create policy "Permissão total para todos"
  on public.appointments for all using (true) with check (true);

-- =============================================
-- TRIGGER: cria profile ao registrar
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- DADOS INICIAIS
-- =============================================
insert into public.barbers (name, role, bio, email) values
  ('Carlos Silva', 'Master Barber', '15 anos de experiência. Especialista em degradê e barba.', 'carlos@barberpro.com'),
  ('Rafael Costa', 'Senior Barber', 'Apaixonado por estilos clássicos e modernos.', 'rafael@barberpro.com'),
  ('Bruno Mendes', 'Barber', 'Especialista em cortes infantis e degradê.', 'bruno@barberpro.com');

insert into public.services (name, description, price, duration) values
  ('Corte Clássico', 'Corte tradicional com acabamento perfeito', 45.00, 30),
  ('Corte + Barba', 'Combo completo: corte e modelagem de barba', 75.00, 60),
  ('Degradê', 'Degradê moderno com máquina e tesoura', 55.00, 45),
  ('Barba Completa', 'Toalha quente, navalha e hidratação', 35.00, 30),
  ('Hidratação', 'Tratamento capilar premium', 25.00, 20),
  ('Sobrancelha', 'Design e acabamento da sobrancelha', 15.00, 15);

-- =============================================
-- COMO VINCULAR BARBEIRO A UM USUÁRIO
-- Após o barbeiro criar conta pelo site, execute:
--
-- update public.profiles
--   set role = 'barber', barber_id = 1
--   where id = 'cole-o-uuid-do-usuario-aqui';
--
-- O UUID aparece em: Supabase → Auth → Users
-- O barber_id é o id na tabela barbers acima
-- =============================================
