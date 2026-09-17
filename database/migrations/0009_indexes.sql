create index idx_package_import_hash on package_imports(archive_hash);
create index idx_skill_domain on skills(domain);
create index idx_workflow_runs_workspace on workflow_runs(workspace_id);
create index idx_workflow_runs_status on workflow_runs(status);
create index idx_workflow_steps_status on workflow_steps(status);
create index idx_audit_workspace_time on audit_events(workspace_id,created_at desc);
create index idx_knowledge_fulltext on knowledge_objects using gin (
 to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,'')));
