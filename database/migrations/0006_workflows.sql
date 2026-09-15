create table workflow_definitions (
 id uuid primary key default gen_random_uuid(), canonical_id text unique not null, name text not null,
 workspace_type text, status object_status not null default 'active', created_at timestamptz not null default now());
create table workflow_versions (
 id uuid primary key default gen_random_uuid(), workflow_definition_id uuid not null references workflow_definitions(id) on delete cascade,
 version text not null, definition jsonb not null, definition_hash text not null, created_at timestamptz not null default now(),
 unique(workflow_definition_id,version));
create table workflow_runs (
 id uuid primary key default gen_random_uuid(), workflow_version_id uuid not null references workflow_versions(id),
 workspace_id uuid not null references workspaces(id), initiated_by uuid references app_users(id),
 status workflow_status not null default 'queued', variables jsonb not null default '{}'::jsonb,
 idempotency_key text, started_at timestamptz, completed_at timestamptz,
 created_at timestamptz not null default now(), unique(workspace_id,idempotency_key));
create table workflow_steps (
 id uuid primary key default gen_random_uuid(), workflow_run_id uuid not null references workflow_runs(id) on delete cascade,
 step_key text not null, step_type text not null, status step_status not null default 'pending',
 attempt_count integer not null default 0, idempotency_key text, input_data jsonb not null default '{}'::jsonb,
 output_data jsonb not null default '{}'::jsonb, error_code text, error_details jsonb, started_at timestamptz,
 completed_at timestamptz, unique(workflow_run_id,step_key));
create table artifacts (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references workspaces(id),
 workflow_run_id uuid references workflow_runs(id), artifact_type text not null, title text, storage_path text,
 content_hash text, classification security_classification not null, verification verification_status not null default 'unverified',
 created_by_type text, created_by_id text, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now());
create table approvals (
 id uuid primary key default gen_random_uuid(), workflow_run_id uuid not null references workflow_runs(id),
 workflow_step_id uuid references workflow_steps(id), requested_by text not null, required_role workspace_role not null,
 status approval_status not null default 'pending', requested_at timestamptz not null default now(),
 resolved_at timestamptz, resolved_by uuid references app_users(id), decision_note text);
