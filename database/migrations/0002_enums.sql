create type object_status as enum ('imported','validated','approved','active','disabled','quarantined');
create type security_classification as enum ('public','internal','confidential','restricted');
create type execution_access as enum ('read_only','controlled_mutation','external_action');
create type verification_status as enum ('unverified','pending','structurally_validated','source_verified','authoritatively_verified','pass','pass_with_warnings','failed','conflict','human_review','quarantined');
create type workflow_status as enum ('queued','running','waiting_for_input','waiting_for_approval','completed','failed','cancelled','quarantined');
create type step_status as enum ('pending','running','succeeded','failed','skipped','blocked');
create type approval_status as enum ('pending','approved','rejected','cancelled');
create type workspace_role as enum ('owner','admin','contributor','reviewer','viewer');
