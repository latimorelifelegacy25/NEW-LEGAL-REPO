create table integrations (
 id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id), canonical_id text unique not null,
 provider text not null, integration_type text not null, status object_status not null default 'imported',
 configuration jsonb not null default '{}'::jsonb, secret_reference text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
