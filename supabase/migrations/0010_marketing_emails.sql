-- Samtycke för marknadsföringsmejl (träningstips, påminnelser, erbjudanden).
-- Standard är på (soft opt-in enligt marknadsföringslagen — kunden
-- informeras vid kontoskapande och kan avsluta när som helst), separat
-- från transaktionella mejl (t.ex. kontaktformulärets bekräftelse) som
-- inte styrs av den här flaggan.

alter table public.profiles
  add column marketing_emails boolean not null default true;
