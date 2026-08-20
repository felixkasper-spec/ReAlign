-- ReAlign Metoden — initialt databasschema
-- Tabeller enligt briefingen: users, subscriptions, favorites, programs,
-- exercises, logged_sessions. "users" implementeras som public.profiles
-- (1:1 med auth.users) eftersom auth.users ägs av Supabase Auth och inte
-- kan utökas direkt.

create extension if not exists "pgcrypto";

-- PROFILES ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Användare kan läsa sin egen profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Användare kan uppdatera sin egen profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Skapa automatiskt en profilrad när ett nytt konto registreras
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SUBSCRIPTIONS ---------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled')),
  plan text not null default 'premium',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create unique index subscriptions_user_id_key on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

create policy "Användare kan läsa sin egen prenumeration"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Inga insert/update-policyer för klienter: prenumerationsstatus skrivs
-- enbart av Stripe-webhooken via service_role-nyckeln.

-- PROGRAMS ----------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  level int,
  description text,
  created_at timestamptz not null default now()
);

alter table public.programs enable row level security;

create policy "Alla kan läsa program"
  on public.programs for select
  using (true);

-- EXERCISES ---------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body_part text not null,
  equipment text,
  video_url text,
  instructions text,
  tips text,
  sets_reps text,
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "Alla kan läsa övningar"
  on public.exercises for select
  using (true);

-- PROGRAM_EXERCISES (koppling program <-> övning, med ordning) ------------
create table public.program_exercises (
  program_id uuid not null references public.programs (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index int not null default 0,
  primary key (program_id, exercise_id)
);

alter table public.program_exercises enable row level security;

create policy "Alla kan läsa programmens övningslistor"
  on public.program_exercises for select
  using (true);

-- FAVORITES ----------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

alter table public.favorites enable row level security;

create policy "Användare hanterar sina egna favoriter"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- LOGGED_SESSIONS -----------------------------------------------------------
create table public.logged_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid references public.programs (id) on delete set null,
  title text not null,
  completed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.logged_sessions enable row level security;

create policy "Användare hanterar sina egna loggade pass"
  on public.logged_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
