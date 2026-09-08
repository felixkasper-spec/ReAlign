-- Kundprogram: coachen (Felix) sätter ihop ett skräddarsytt program åt en
-- fysisk klinikkund och delar det som en öppen länk (/p/<token>) — helt
-- utan konto eller Premium-spärr för mottagaren. RLS är påslaget utan
-- några policyer, så bara service-role-klienten (server-kod,
-- lib/supabase/admin.ts) kan läsa/skriva — anon-nyckeln kommer aldrig åt
-- tabellerna, så det går inte att lista/läsa andra kunders program via
-- klienten.
create table public.clinic_programs (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

alter table public.clinic_programs enable row level security;

create table public.clinic_program_exercises (
  clinic_program_id uuid not null references public.clinic_programs (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  notes text,
  order_index int not null default 0,
  primary key (clinic_program_id, exercise_id)
);

alter table public.clinic_program_exercises enable row level security;
