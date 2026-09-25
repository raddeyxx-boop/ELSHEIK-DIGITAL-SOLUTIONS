create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger media_updated before update on public.media for each row execute function public.set_updated_at();
create trigger services_updated before update on public.services for each row execute function public.set_updated_at();
create trigger technologies_updated before update on public.technologies for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger case_studies_updated before update on public.case_studies for each row execute function public.set_updated_at();
create trigger testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();
create trigger insights_updated before update on public.insights for each row execute function public.set_updated_at();
create trigger inquiries_updated before update on public.inquiries for each row execute function public.set_updated_at();

create or replace function public.audit_project_change() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ declare action_name text; resource_id uuid; begin resource_id=coalesce(new.id,old.id); if tg_op='INSERT' then action_name='project.created'; elsif tg_op='DELETE' then action_name='project.deleted'; elsif new.status is distinct from old.status then action_name=case new.status when 'published' then 'project.published' when 'archived' then 'project.archived' else 'project.unpublished' end; else action_name='project.updated'; end if; insert into public.audit_logs(actor_id,action,resource,resource_id,metadata) values(auth.uid(),action_name,'project',resource_id,jsonb_build_object('operation',tg_op)); return coalesce(new,old); end; $$;
create trigger audit_project after insert or update or delete on public.projects for each row execute function public.audit_project_change();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('public-media','public-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','video/mp4']),
('private-media','private-media',false,20971520,array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','video/mp4'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "public media objects readable" on storage.objects for select using(bucket_id='public-media');
create policy "editors read private media" on storage.objects for select to authenticated using(bucket_id='private-media' and public.can_edit_content());
create policy "editors upload media" on storage.objects for insert to authenticated with check(bucket_id in ('public-media','private-media') and public.can_edit_content() and (storage.foldername(name))[1]=auth.uid()::text);
create policy "editors update own media" on storage.objects for update to authenticated using(bucket_id in ('public-media','private-media') and public.can_edit_content() and owner_id=auth.uid()::text) with check(bucket_id in ('public-media','private-media') and public.can_edit_content());
create policy "admins delete media" on storage.objects for delete to authenticated using(bucket_id in ('public-media','private-media') and public.has_role('admin'));

