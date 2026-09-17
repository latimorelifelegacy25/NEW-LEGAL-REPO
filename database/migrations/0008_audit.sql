create table audit_events (
 id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id), actor_type text not null,
 actor_id text, event_type text not null, resource_type text, resource_id text, trace_id uuid,
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create or replace function prevent_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'audit_events are append-only'; end; $$;
create trigger audit_no_update before update on audit_events for each row execute function prevent_audit_mutation();
create trigger audit_no_delete before delete on audit_events for each row execute function prevent_audit_mutation();
