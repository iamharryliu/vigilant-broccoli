alter table home_recurring_tasks
  add column assigned_user_id uuid references auth.users(id) on delete set null;

alter table home_one_off_tasks
  add column assigned_user_id uuid references auth.users(id) on delete set null;
