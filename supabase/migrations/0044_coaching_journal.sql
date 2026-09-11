-- Privat journal per Premium Coaching-kund: coachens egna anteckningar och
-- media, som kunden aldrig ska kunna se. Precis som clinic_programs har
-- tabellen RLS påslaget men inga policyer alls — bara service-role-klienten
-- (coachens adminklient) kommer åt raderna, kundens egen RLS-styrda session
-- får ingenting.
create table public.coaching_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text,
  attachment_path text,
  attachment_type text check (attachment_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  constraint coaching_journal_entries_has_content check (
    (body is not null and char_length(trim(body)) > 0) or attachment_path is not null
  )
);

create index coaching_journal_entries_user_id_idx
  on public.coaching_journal_entries (user_id, created_at desc);

alter table public.coaching_journal_entries enable row level security;

insert into storage.buckets (id, name, public)
values ('coaching-journal', 'coaching-journal', false)
on conflict (id) do nothing;
-- Ingen storage-policy heller, av samma anledning — bara service-role
-- (coachens adminklient) kan ladda upp eller skapa signerade läs-URL:er.
