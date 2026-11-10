alter table home_recurring_tasks
  add column monthly_nth smallint[]
    constraint home_recurring_tasks_monthly_nth_check check (
      monthly_nth is null
      or (
        cardinality(monthly_nth) > 0
        and monthly_nth <@ array[1, 2, 3, 4, -1]::smallint[]
      )
    );
