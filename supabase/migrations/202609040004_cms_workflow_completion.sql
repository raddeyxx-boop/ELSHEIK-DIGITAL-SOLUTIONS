alter table public.project_results add column if not exists publishable boolean not null default false;
alter table public.media add column if not exists original_filename text;
create index if not exists project_results_public_idx on public.project_results(project_id,sort_order) where verified and publishable;
