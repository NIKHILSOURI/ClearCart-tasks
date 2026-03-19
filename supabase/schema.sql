create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'todo',
  color text default '#818cf8',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  assigned_name text not null,
  status text not null default 'todo',
  priority text not null default 'medium',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  due_date date,
  start_date date,
  blocked boolean not null default false,
  delayed boolean not null default false,
  blocker_reason text,
  delay_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  update_type text not null,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_name text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  action text not null,
  actor_name text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row execute function set_updated_at();

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at
before update on tasks
for each row execute function set_updated_at();

alter table projects enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table task_updates enable row level security;
alter table task_comments enable row level security;
alter table activity_logs enable row level security;

drop policy if exists "public full access projects" on projects;
create policy "public full access projects" on projects for all using (true) with check (true);
drop policy if exists "public full access tasks" on tasks;
create policy "public full access tasks" on tasks for all using (true) with check (true);
drop policy if exists "public full access subtasks" on subtasks;
create policy "public full access subtasks" on subtasks for all using (true) with check (true);
drop policy if exists "public full access updates" on task_updates;
create policy "public full access updates" on task_updates for all using (true) with check (true);
drop policy if exists "public full access comments" on task_comments;
create policy "public full access comments" on task_comments for all using (true) with check (true);
drop policy if exists "public full access activity" on activity_logs;
create policy "public full access activity" on activity_logs for all using (true) with check (true);
