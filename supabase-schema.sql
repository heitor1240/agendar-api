-- =============================================
-- BARBERPRO — SCHEMA SUPABASE (PRODUÇÃO)
-- Execute TODO este arquivo no SQL Editor do Supabase
-- Se já executou antes: rode o DROP TABLE abaixo primeiro
-- =============================================

drop table if exists public.appointments cascade;
drop table if exists public.schedules cascade;
drop table if exists public.barber_services cascade;
drop table if exists public.services cascade;
drop table if exists public.barbers cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user cascade;
drop function if exists public.book_appointment_safe cascade;

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

-- Cada usuário lê e edita apenas o próprio perfil
-- Admin lê tudo via role no JWT (sem recursão)
create policy "profiles: select"
  on public.profiles for select
  using (
    auth.uid() = id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "profiles: atualização própria"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Inserção permitida apenas via trigger (handle_new_user) com security definer
create policy "profiles: inserção via trigger"
  on public.profiles for insert
  with check (auth.uid() = id);

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

-- Qualquer pessoa (inclusive visitantes) pode ver barbeiros ativos
create policy "barbers: leitura pública de ativos"
  on public.barbers for select
  using (active = true);

-- Apenas admin pode inserir, editar ou desativar barbers
create policy "barbers: escrita apenas admin"
  on public.barbers for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- SERVICES
-- =============================================
create table public.services (
  id bigserial primary key,
  name text not null,
  description text default '',
  price numeric(10,2) not null check (price >= 0),
  duration integer not null default 30 check (duration > 0),
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.services enable row level security;

-- Qualquer pessoa pode ver serviços ativos
create policy "services: leitura pública de ativos"
  on public.services for select
  using (active = true);

-- Apenas admin pode inserir, editar ou desativar services
create policy "services: escrita apenas admin"
  on public.services for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

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
  service_price numeric(10,2) not null check (service_price >= 0),
  service_name text not null,
  barber_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.appointments enable row level security;

-- Constraint para evitar double-booking: mesmo barbeiro, data e hora não pode ter dois agendamentos confirmados/pendentes
create unique index appointments_no_double_booking
  on public.appointments (barber_id, date, time)
  where (status in ('confirmed', 'pending'));

-- Visitantes não autenticados podem inserir (agendamento sem conta)
create policy "appointments: qualquer um pode agendar"
  on public.appointments for insert
  with check (true);

-- Usuário autenticado vê apenas seus próprios agendamentos
create policy "appointments: cliente vê os seus"
  on public.appointments for select
  using (
    client_email = (
      select email from auth.users where id = auth.uid()
    )
    or user_id = auth.uid()
  );

-- Cliente autenticado pode cancelar apenas os seus
create policy "appointments: cliente cancela os seus"
  on public.appointments for update
  using (
    (client_email = (select email from auth.users where id = auth.uid()) or user_id = auth.uid())
    and status in ('confirmed', 'pending')
  )
  with check (status = 'cancelled');

-- Barbeiro vê os agendamentos do seu barber_id (via JWT barber_id)
create policy "appointments: barbeiro vê os dele"
  on public.appointments for select
  using (
    barber_id = (auth.jwt() -> 'user_metadata' ->> 'barber_id')::bigint
    or barber_id = (auth.jwt() -> 'app_metadata' ->> 'barber_id')::bigint
  );

-- Barbeiro pode atualizar status dos seus agendamentos
create policy "appointments: barbeiro atualiza os dele"
  on public.appointments for update
  using (
    barber_id = (auth.jwt() -> 'user_metadata' ->> 'barber_id')::bigint
    or barber_id = (auth.jwt() -> 'app_metadata' ->> 'barber_id')::bigint
  );

-- Admin tem acesso total aos agendamentos
create policy "appointments: admin acesso total"
  on public.appointments for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- SCHEDULES (Horários e Bloqueios)
-- =============================================
create table public.schedules (
  id bigserial primary key,
  barber_id bigint not null references public.barbers(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'available' check (status in ('available', 'blocked')),
  unique(barber_id, date, time)
);
alter table public.schedules enable row level security;

-- Qualquer pessoa pode ver horários (para saber quais estão disponíveis)
create policy "schedules: leitura pública"
  on public.schedules for select
  using (true);

-- Barbeiro gerencia sua própria agenda (via JWT barber_id)
create policy "schedules: barbeiro gerencia a sua"
  on public.schedules for all
  using (
    barber_id = (auth.jwt() -> 'user_metadata' ->> 'barber_id')::bigint
    or barber_id = (auth.jwt() -> 'app_metadata' ->> 'barber_id')::bigint
  )
  with check (
    barber_id = (auth.jwt() -> 'user_metadata' ->> 'barber_id')::bigint
    or barber_id = (auth.jwt() -> 'app_metadata' ->> 'barber_id')::bigint
  );

-- Admin gerencia todas as agendas
create policy "schedules: admin gerencia tudo"
  on public.schedules for all
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- FUNÇÃO TRANSACIONAL: book_appointment_safe
-- Previne race conditions: verifica disponibilidade e insere atomicamente
-- =============================================
create or replace function public.book_appointment_safe(
  p_barber_id bigint,
  p_service_id bigint,
  p_date date,
  p_time time,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_service_price numeric,
  p_service_name text,
  p_barber_name text,
  p_notes text default '',
  p_user_id uuid default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_conflict int;
  v_blocked int;
  v_appointment public.appointments;
begin
  -- Verifica se o horário está bloqueado
  select count(*) into v_blocked
  from public.schedules
  where barber_id = p_barber_id
    and date = p_date
    and time = p_time
    and status = 'blocked';

  if v_blocked > 0 then
    return json_build_object('error', 'Horário bloqueado pelo barbeiro.');
  end if;

  -- Verifica se já existe agendamento ativo no mesmo horário (lock pessimista)
  select count(*) into v_conflict
  from public.appointments
  where barber_id = p_barber_id
    and date = p_date
    and time = p_time
    and status in ('confirmed', 'pending')
  for update;

  if v_conflict > 0 then
    return json_build_object('error', 'Horário já foi reservado. Por favor escolha outro.');
  end if;

  -- Insere o agendamento com segurança
  insert into public.appointments (
    barber_id, service_id, date, time,
    client_name, client_email, client_phone,
    service_price, service_name, barber_name,
    notes, status, user_id
  ) values (
    p_barber_id, p_service_id, p_date, p_time,
    p_client_name, p_client_email, p_client_phone,
    p_service_price, p_service_name, p_barber_name,
    p_notes, 'confirmed', p_user_id
  )
  returning * into v_appointment;

  return json_build_object('data', row_to_json(v_appointment), 'error', null);

exception
  when unique_violation then
    return json_build_object('error', 'Horário já foi reservado. Por favor escolha outro.');
  when others then
    return json_build_object('error', 'Erro interno ao realizar agendamento.');
end;
$$;

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  barber_rec record;
begin
  select id into barber_rec from public.barbers where email = new.email;

  if barber_rec is not null then
    insert into public.profiles (id, name, phone, role, barber_id)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      'barber',
      barber_rec.id
    )
    on conflict (id) do nothing;

    -- Grava role e barber_id no JWT (app_metadata) para uso nas RLS policies
    update auth.users
      set raw_app_meta_data = raw_app_meta_data
        || jsonb_build_object('role', 'barber', 'barber_id', barber_rec.id::text)
      where id = new.id;
  else
    insert into public.profiles (id, name, phone, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      'client'
    )
    on conflict (id) do nothing;

    update auth.users
      set raw_app_meta_data = raw_app_meta_data
        || jsonb_build_object('role', 'client')
      where id = new.id;
  end if;

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
-- COMO PROMOVER UM USUÁRIO A ADMIN
-- Após criar a conta, execute no SQL Editor:
--
-- select public.set_user_role('cole-o-uuid-aqui', 'admin', null);
--
-- OU manualmente:
-- update public.profiles set role = 'admin' where id = 'uuid';
-- update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--   where id = 'uuid';
--
-- O UUID aparece em: Supabase → Auth → Users
-- =============================================

-- =============================================
-- COMO VINCULAR BARBEIRO A UM USUÁRIO
-- Após o barbeiro criar conta pelo site, execute:
--
-- update public.profiles set role = 'barber', barber_id = 1 where id = 'uuid';
-- update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"barber","barber_id":"1"}'
--   where id = 'uuid';
--
-- O UUID aparece em: Supabase → Auth → Users
-- O barber_id é o id na tabela barbers acima
-- =============================================
