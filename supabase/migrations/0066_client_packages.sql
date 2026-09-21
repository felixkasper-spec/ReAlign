-- Enkel "upplägg"-lista (kundpaket) för att hålla koll på pågående och
-- avslutade träningsupplägg — inte kopplad till bookings/customer_phone,
-- bara ett fritt namnfält, precis som ett kalkylark. RLS är på men utan
-- klientpolicyer, samma mönster som booking_weekly_availability: bara
-- service-role-klienten (admin-sidan) läser/skriver.
create table public.client_packages (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  sessions_used int not null default 0,
  sessions_purchased int not null default 0,
  note_1 text,
  note_2 text,
  status text not null default 'active' check (status in ('active', 'completed')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.client_packages enable row level security;
