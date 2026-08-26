-- Egna program: användare kombinerar sina favoritövningar till ett eget,
-- namngivet, ordnat program. Samma mönster som programs/program_exercises,
-- men ägt av användaren istället för redaktionellt innehåll.
create table public.custom_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.custom_programs enable row level security;

create policy "Användare hanterar sina egna program"
  on public.custom_programs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.custom_program_exercises (
  custom_program_id uuid not null references public.custom_programs (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index int not null default 0,
  primary key (custom_program_id, exercise_id)
);

alter table public.custom_program_exercises enable row level security;

create policy "Användare hanterar övningar i sina egna program"
  on public.custom_program_exercises for all
  using (
    exists (
      select 1 from public.custom_programs cp
      where cp.id = custom_program_id and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.custom_programs cp
      where cp.id = custom_program_id and cp.user_id = auth.uid()
    )
  );

-- Ett loggat pass kan nu peka på antingen ett redaktionellt program
-- (program_id, redan existerande) eller ett eget (custom_program_id) —
-- aldrig båda.
alter table public.logged_sessions
  add column custom_program_id uuid references public.custom_programs (id) on delete set null;
