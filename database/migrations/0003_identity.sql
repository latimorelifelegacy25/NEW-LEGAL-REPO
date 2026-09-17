create table app_users (
 id uuid primary key default gen_random_uuid(), auth_user_id uuid unique, email citext unique not null,
 display_name text, status object_status not null default 'active',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table workspaces (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
 classification security_classification not null default 'internal',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table workspace_memberships (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references workspaces(id) on delete cascade,
 user_id uuid not null references app_users(id) on delete cascade, role workspace_role not null,
 created_at timestamptz not null default now(), unique(workspace_id,user_id));
