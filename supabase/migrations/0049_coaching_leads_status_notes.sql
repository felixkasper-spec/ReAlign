-- Byt den enkla "kontaktad"-flaggan mot en statusklassificering som
-- matchar coachens faktiska uppföljningsflöde, plus fritextkommentarer
-- per lead.
alter table public.coaching_leads
  add column status text
    check (status in ('no_answer', 'not_interested', 'purchased', 'follow_up')),
  add column notes text;

alter table public.coaching_leads drop column contacted_at;
