-- Keeps the previous text of every whiteboard save so a wiped or clobbered
-- board can be restored without the nightly pg_dump. Only non-empty prior
-- content is kept (an empty board has nothing to recover), capped at the 50
-- newest rows per board.

create table whiteboard_history (
  id bigint generated always as identity primary key,
  home_id bigint not null references homes(id) on delete cascade,
  board_key text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index whiteboard_history_board_idx
  on whiteboard_history (home_id, board_key, id desc);

alter table whiteboard_history enable row level security;

-- Read-only for members (mirrors the whiteboards policy); with no insert,
-- update or delete policy, clients cannot write history rows.
create policy "Users can read whiteboard history for their homes"
  on whiteboard_history
  for select
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

-- Security definer so the trigger can insert/prune despite the absence of
-- client write policies; search_path is pinned because of that.
create or replace function record_whiteboard_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.content is distinct from old.content and old.content <> '' then
    insert into whiteboard_history (home_id, board_key, content)
    values (old.home_id, old.board_key, old.content);

    delete from whiteboard_history
    where home_id = old.home_id
      and board_key = old.board_key
      and id not in (
        select id from whiteboard_history
        where home_id = old.home_id and board_key = old.board_key
        order by id desc
        limit 50
      );
  end if;
  return new;
end;
$$;

create trigger whiteboards_record_history
  after update on whiteboards
  for each row execute function record_whiteboard_history();
