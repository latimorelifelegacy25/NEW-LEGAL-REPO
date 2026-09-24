-- Secure-by-default workspace policies for Supabase/PostgREST-style JWT sessions.
-- A direct database/service connection may bypass RLS only when its database role
-- is explicitly configured to do so. Ordinary JWT users must have a workspace membership.

create or replace function current_app_user_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from app_users
  where auth_user_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  limit 1
$$;

create or replace function is_workspace_member(target_workspace uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_memberships wm
    where wm.workspace_id = target_workspace and wm.user_id = current_app_user_id()
  )
$$;

create policy data_sources_workspace_members on data_sources
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy knowledge_objects_workspace_members on knowledge_objects
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy workflow_runs_workspace_members on workflow_runs
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy artifacts_workspace_members on artifacts
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy audit_events_workspace_members on audit_events
  for select using (workspace_id is null or is_workspace_member(workspace_id));

-- integrations has a workspace_id in migration 0007.
create policy integrations_workspace_members on integrations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));
