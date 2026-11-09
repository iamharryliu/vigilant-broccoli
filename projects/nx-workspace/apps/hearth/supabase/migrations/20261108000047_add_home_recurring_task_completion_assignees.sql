alter table home_recurring_task_completions
  add column assigned_user_id uuid references auth.users(id) on delete set null;
