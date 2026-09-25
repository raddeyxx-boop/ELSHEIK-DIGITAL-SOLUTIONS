revoke select on table public.project_results from anon;
grant select(id,project_id,label_en,label_ar,value,context_en,context_ar,verified,publishable,sort_order,created_at) on table public.project_results to anon;
