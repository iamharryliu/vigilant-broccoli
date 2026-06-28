alter table calendar_events
  add column leisure_activity_id uuid references leisure_activities(id) on delete set null;
