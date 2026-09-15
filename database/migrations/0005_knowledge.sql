create table data_sources (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references workspaces(id),
 canonical_id text unique not null, name text not null, source_type text not null, format text, source_path text,
 classification security_classification not null, verification verification_status not null default 'unverified',
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now());
create table knowledge_objects (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references workspaces(id),
 data_source_id uuid references data_sources(id), object_type text not null, title text, content_text text,
 classification security_classification not null, verification verification_status not null default 'unverified',
 metadata jsonb not null default '{}'::jsonb, source_locator jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table knowledge_chunks (
 id uuid primary key default gen_random_uuid(), knowledge_object_id uuid not null references knowledge_objects(id) on delete cascade,
 chunk_index integer not null, content text not null, embedding vector, metadata jsonb not null default '{}'::jsonb,
 unique(knowledge_object_id,chunk_index));
