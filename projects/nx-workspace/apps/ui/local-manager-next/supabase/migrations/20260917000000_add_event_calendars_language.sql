-- Language the sync writes each event's title and description in; null keeps
-- the source event's own language.
alter table event_calendars add column language text;
