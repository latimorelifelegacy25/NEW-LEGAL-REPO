create table packages (
 id uuid primary key default gen_random_uuid(), name text not null, publisher text, canonical_version text,
 package_hash text unique not null, status object_status not null default 'imported',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table package_imports (
 id uuid primary key default gen_random_uuid(), package_id uuid references packages(id), original_filename text not null,
 source_path text not null, archive_hash text not null, duplicate_of uuid references package_imports(id),
 status object_status not null default 'imported', metadata jsonb not null default '{}'::jsonb,
 imported_at timestamptz not null default now());
create table skills (
 id uuid primary key default gen_random_uuid(), canonical_id text unique not null, name text not null,
 domain text not null, skill_type text not null, description text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table skill_versions (
 id uuid primary key default gen_random_uuid(), skill_id uuid not null references skills(id) on delete cascade,
 package_id uuid references packages(id), version text not null, content_hash text not null,
 execution_access execution_access not null default 'read_only', status object_status not null default 'imported',
 manifest jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 unique(skill_id,version,content_hash));
create table runtimes (
 id uuid primary key default gen_random_uuid(), canonical_id text unique not null, name text not null,
 runtime_type text not null, status object_status not null default 'active', capabilities jsonb not null default '{}'::jsonb);
create table runtime_bindings (
 id uuid primary key default gen_random_uuid(), skill_version_id uuid not null references skill_versions(id) on delete cascade,
 runtime_id uuid not null references runtimes(id) on delete cascade, projection_path text, adapter text,
 configuration jsonb not null default '{}'::jsonb, status object_status not null default 'active',
 unique(skill_version_id,runtime_id));
create table tools (
 id uuid primary key default gen_random_uuid(), canonical_id text unique not null, name text not null,
 tool_type text not null, input_schema jsonb not null, output_schema jsonb, execution_handler text not null,
 execution_access execution_access not null default 'read_only', status object_status not null default 'imported',
 created_at timestamptz not null default now());
