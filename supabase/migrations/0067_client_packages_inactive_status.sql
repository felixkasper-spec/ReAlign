-- Tredje status på upplägg: "inactive" — kunder som har sessioner kvar men
-- inte har någon bokad tid just nu, oavsett anledning. Skiljer sig från
-- "completed" (klart) genom att de fortfarande förväntas komma tillbaka.
alter table public.client_packages
  drop constraint client_packages_status_check;

alter table public.client_packages
  add constraint client_packages_status_check
  check (status in ('active', 'inactive', 'completed'));
