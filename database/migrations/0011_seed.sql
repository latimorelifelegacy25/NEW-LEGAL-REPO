insert into workspaces (name,slug) values
('Legal','legal'),('Business','business'),('Marketing','marketing'),
('Engineering','engineering'),('Research','research'),('Personal','personal')
on conflict (slug) do nothing;
insert into runtimes (canonical_id,name,runtime_type) values
('internal','Internal','internal'),('claude-code','Claude Code','external'),
('cursor','Cursor','external'),('codex','Codex','external')
on conflict (canonical_id) do nothing;
