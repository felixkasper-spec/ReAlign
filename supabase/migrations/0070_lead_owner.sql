-- Två oberoende coacher (Felix & Christopher) kör sina egna annonser var
-- för sig, väldigt självständigt — den som sätter igång sin annons vill
-- veta att just DE leadsen hamnar på deras egen lista, utan att behöva
-- koordinera UTM-taggar per annons.
--
-- lead_owner_setting är en enda-rads-inställning ("vem kör annonsen just
-- nu") som avgör vem NYA leads tillskrivs vid inskick — vem som helst av
-- de två växlar den när de sätter igång sin egen annons, och den håller
-- sig kvar tills den byts igen. RLS på utan policyer (samma mönster som
-- övriga service-role-only-tabeller) — bara admin-klienten i actions.ts
-- får läsa/skriva den.
create table public.lead_owner_setting (
  id smallint primary key default 1 check (id = 1),
  owner text not null default 'felix' check (owner in ('felix', 'christopher')),
  updated_at timestamptz not null default now()
);

insert into public.lead_owner_setting (id, owner) values (1, 'felix');

alter table public.lead_owner_setting enable row level security;

-- Varje lead stämplas med vem som var aktiv ägare vid inskicket. Nullable
-- eftersom redan existerande leads (innan den här funktionen fanns) saknar
-- ett meningsfullt värde — de visas som "Okänd" i listan istället för att
-- gissa fel.
alter table public.coaching_leads
  add column owner text check (owner in ('felix', 'christopher'));
