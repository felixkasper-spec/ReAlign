// Supabase/PostgREST ger som standard bara tillbaka max 1000 rader per
// fråga — utan paginering klipptes resultatet tyst av där (inget fel, bara
// en ofullständig lista) så fort en tabell växte förbi den gränsen. Hände
// på riktigt på Cleer Kliniks motsvarande kundlista (2500+ rader efter en
// bulk-import) och samma klass av bugg riskerar bookings/customers här
// också i takt med att de växer.
const PAGE_SIZE = 1000;

export async function fetchAllPages<T>(
  loadPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<{ data: T[]; error: unknown }> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await loadPage(from, from + PAGE_SIZE - 1);
    if (error) return { data: all, error };
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return { data: all, error: null };
}
