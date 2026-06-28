alter table where_is_items
  add column home_id int not null references homes(id) on delete cascade;

create index where_is_items_home_id_idx on where_is_items(home_id);
