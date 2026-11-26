-- Loggar varje meddelande i den publika lead-chattboten (ChatWidget.tsx) —
-- konversationen hölls tidigare bara i klientens state och försvann helt
-- när besökaren stängde fliken. session_id genereras en gång per besökares
-- chattsession (klientsidan, se ChatWidget.tsx) och grupperar ihop
-- meddelandena till en tråd i admin-vyn (se app/coaching/chattbot). Portat
-- från Cleer Klinik (samma migration där, 0060).
-- RLS på utan klientpolicyer — bara service-role-klienten (server actionen
-- i lib/chat-widget-actions.ts) skriver.
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_session_idx on public.chat_messages (session_id, created_at);

alter table public.chat_messages enable row level security;
