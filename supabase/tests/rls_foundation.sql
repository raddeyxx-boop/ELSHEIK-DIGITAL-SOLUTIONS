-- Run with Supabase CLI after `supabase start`.
begin;
set local role anon;
select count(*) from public.projects where status <> 'published';
-- Expected: 0. Direct inquiry access must fail because no anon policy exists.
rollback;

