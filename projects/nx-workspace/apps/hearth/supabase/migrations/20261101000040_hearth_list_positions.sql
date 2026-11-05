alter table leisure_activities
  add column position integer not null default 0;

with ranked_activities as (
  select
    id,
    row_number() over (partition by home_id order by created_at, id) - 1 as position
  from leisure_activities
)
update leisure_activities
set position = ranked_activities.position
from ranked_activities
where leisure_activities.id = ranked_activities.id;

with ranked_items as (
  select
    id,
    row_number() over (partition by home_id order by created_at, id) - 1 as position
  from grocery_items
)
update grocery_items
set position = ranked_items.position
from ranked_items
where grocery_items.id = ranked_items.id;

with ranked_items as (
  select
    id,
    row_number() over (partition by home_id order by created_at, id) - 1 as position
  from kitchen_chore_items
)
update kitchen_chore_items
set position = ranked_items.position
from ranked_items
where kitchen_chore_items.id = ranked_items.id;
