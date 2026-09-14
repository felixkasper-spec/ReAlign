-- Intag-formulär för nya Premium Coaching-prenumeranter — allt Felix
-- behöver för att bygga deras skräddarsydda program (symptom, mål,
-- utrustning, hållningsfoton m.m.). Separat från /analys (som bara
-- rekommenderar ett befintligt bibliotekprogram) och från
-- clinic_programs (fysiska klinikpatienter, inte prenumeranter).
-- En rad per användare — formuläret är ett aktuellt "läge", inte en
-- logg, så det går att fylla i på nytt och skriva över tidigare svar.
create table public.coaching_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  height_cm int,
  weight_kg int,
  symptoms text not null,
  pain_level int,
  previous_injuries text,
  medications text,
  sedentary_work text,
  sleep_habits text,
  current_training text,
  equipment_access text,
  session_length text,
  weekly_time_budget text,
  goals text,
  other_info text,
  photo_paths text[] not null default '{}',
  submitted_at timestamptz not null default now()
);

alter table public.coaching_intake enable row level security;

create policy "Användare hanterar sitt eget intag"
  on public.coaching_intake for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
