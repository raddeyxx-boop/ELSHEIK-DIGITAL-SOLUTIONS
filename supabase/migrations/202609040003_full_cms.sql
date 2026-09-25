alter type public.inquiry_status add value if not exists 'contacted';
alter type public.inquiry_status add value if not exists 'won';
alter type public.inquiry_status add value if not exists 'lost';
alter type public.inquiry_status add value if not exists 'archived';

alter table public.projects add column if not exists seo_title_en text, add column if not exists seo_title_ar text, add column if not exists seo_description_en text, add column if not exists seo_description_ar text, add column if not exists canonical_url text;
alter table public.services add column if not exists audience_en text, add column if not exists audience_ar text, add column if not exists problems_en text, add column if not exists problems_ar text, add column if not exists deliverables_en text, add column if not exists deliverables_ar text, add column if not exists approach_en text, add column if not exists approach_ar text, add column if not exists seo_title_en text, add column if not exists seo_title_ar text, add column if not exists seo_description_en text, add column if not exists seo_description_ar text;
alter table public.technologies add column if not exists description_en text, add column if not exists description_ar text, add column if not exists media_id uuid references public.media(id) on delete set null, add column if not exists active boolean not null default true;
alter table public.testimonials add column if not exists sort_order integer not null default 0;
alter table public.insights add column if not exists author text, add column if not exists seo_title_en text, add column if not exists seo_title_ar text, add column if not exists seo_description_en text, add column if not exists seo_description_ar text;

create table if not exists public.service_technologies(service_id uuid not null references public.services(id) on delete cascade,technology_id uuid not null references public.technologies(id) on delete restrict,sort_order integer not null default 0,primary key(service_id,technology_id));
alter table public.service_technologies enable row level security;
create policy "public service technologies" on public.service_technologies for select using(exists(select 1 from public.services s where s.id=service_id and s.status='published'));
create policy "editors manage service technologies" on public.service_technologies for all to authenticated using(public.can_edit_content()) with check(public.can_edit_content());

create unique index if not exists architecture_unique_connection on public.architecture_connections(case_study_id,source_node_id,target_node_id);

create or replace function public.audit_content_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ declare resource_name text:=tg_table_name; action_name text; resource_id uuid; begin resource_id=coalesce(new.id,old.id); if tg_op='INSERT' then action_name=resource_name||'.created'; elsif tg_op='DELETE' then action_name=resource_name||'.deleted'; elsif new.status is distinct from old.status then action_name=resource_name||'.'||new.status::text; else action_name=resource_name||'.updated'; end if; insert into public.audit_logs(actor_id,action,resource,resource_id,metadata) values(auth.uid(),action_name,resource_name,resource_id,jsonb_build_object('operation',tg_op)); return coalesce(new,old); end; $$;
create trigger audit_services after insert or update or delete on public.services for each row execute function public.audit_content_change();
create trigger audit_insights after insert or update or delete on public.insights for each row execute function public.audit_content_change();
create trigger audit_testimonials after insert or update or delete on public.testimonials for each row execute function public.audit_content_change();
create trigger audit_media after insert or update or delete on public.media for each row execute function public.audit_content_change();

create or replace function public.audit_inquiry_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin if new.status is distinct from old.status then insert into public.audit_logs(actor_id,action,resource,resource_id,metadata) values(auth.uid(),'inquiry.status_changed','inquiry',new.id,jsonb_build_object('from',old.status,'to',new.status)); end if; return new; end; $$;
create trigger audit_inquiries after update on public.inquiries for each row execute function public.audit_inquiry_change();

create or replace function public.audit_setting_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin insert into public.audit_logs(actor_id,action,resource,metadata) values(auth.uid(),'site_settings.changed','site_settings',jsonb_build_object('key',coalesce(new.key,old.key),'operation',tg_op)); return coalesce(new,old); end; $$;
create trigger audit_settings after insert or update or delete on public.site_settings for each row execute function public.audit_setting_change();
