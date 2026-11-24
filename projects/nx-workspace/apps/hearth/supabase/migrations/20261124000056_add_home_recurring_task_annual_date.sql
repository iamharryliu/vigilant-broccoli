alter table home_recurring_tasks
  add column annual_date text
    constraint home_recurring_tasks_annual_date_check check (
      annual_date is null or annual_date ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'
    );
