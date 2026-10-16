alter table whiteboards
  add column board_key text not null default 'family';

alter table whiteboards
  drop constraint whiteboards_home_id_key;

alter table whiteboards
  add constraint whiteboards_home_id_board_key_key unique (home_id, board_key);
