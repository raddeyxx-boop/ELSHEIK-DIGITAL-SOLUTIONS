select
  (select count(*) from information_schema.tables where table_schema='public' and table_name in ('profiles','user_roles','services','technologies','projects','case_studies','project_media','project_technologies','project_results','customer_journey_steps','architecture_nodes','architecture_connections','testimonials','insights','inquiries','media','site_settings','audit_logs')) as required_tables,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relrowsecurity and c.relname in ('profiles','user_roles','services','technologies','projects','case_studies','project_media','project_technologies','project_results','customer_journey_steps','architecture_nodes','architecture_connections','testimonials','insights','inquiries','media','site_settings','audit_logs')) as rls_enabled_tables,
  (select count(*) from information_schema.table_constraints where table_schema='public' and constraint_type='FOREIGN KEY') as foreign_keys,
  (select count(*) from pg_indexes where schemaname='public') as application_indexes,
  (select count(*) from pg_policies where schemaname in ('public','storage')) as application_policies,
  (select count(*) from storage.buckets where id in ('public-media','private-media')) as required_buckets,
  (select count(*) from storage.buckets where id='public-media' and public=true) as public_buckets,
  (select count(*) from storage.buckets where id='private-media' and public=false) as private_buckets;
