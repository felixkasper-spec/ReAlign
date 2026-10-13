-- Ny fråga i "Kom igång"-formuläret (Premium Coaching): rörelsebegränsningar
-- som inte nödvändigtvis beskrivs under "Vad vill du ha hjälp med?" (ett
-- specifikt smärtproblem) men ändå styr vad som är görbart i programmet,
-- t.ex. "kan inte böja mig framåt" eller "kan inte lyfta armarna fritt".
alter table public.coaching_intake
  add column movement_limitations text;
