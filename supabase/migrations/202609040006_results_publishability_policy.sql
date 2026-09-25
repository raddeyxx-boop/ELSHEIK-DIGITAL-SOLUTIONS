drop policy if exists "public verified results" on public.project_results;
create policy "public verified publishable results" on public.project_results for select using(
  verified and publishable and exists(select 1 from public.projects p where p.id=project_id and p.status='published')
);
