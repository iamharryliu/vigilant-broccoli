alter table recipes
  add column tags jsonb not null default '{"flavours": [], "temperatures": [], "methods": [], "textures": []}'::jsonb,
  add column tags_status text check (tags_status in ('SUCCEEDED', 'FAILED')),
  add column tags_attempted_at timestamptz,
  add column revision integer not null default 1,
  add column tags_revision integer not null default 1,
  add constraint recipes_tags_is_object check (jsonb_typeof(tags) = 'object');

create or replace function bump_recipe_revisions()
returns trigger
language plpgsql
as $$
begin
  if (new.title, new.description, new.markdown)
    is distinct from (old.title, old.description, old.markdown) then
    new.revision := old.revision + 1;
  end if;
  if new.tags is distinct from old.tags then
    new.tags_revision := old.tags_revision + 1;
  end if;
  return new;
end;
$$;

create trigger recipes_bump_revisions
  before update on recipes
  for each row execute function bump_recipe_revisions();

-- Runs as the caller (security invoker), so the existing home-level RLS policy
-- on recipes still decides which rows are visible and lockable.
-- Appends candidate tags the recipe lacks, per category, keeping every stored
-- tag. Returns no row when the recipe changed since p_expected_revision.
create or replace function merge_recipe_tags(
  p_id uuid,
  p_expected_revision integer,
  p_tags jsonb
)
returns setof recipes
language plpgsql
security invoker
as $$
declare
  v_recipe recipes;
  v_key text;
  v_existing jsonb;
  v_merged jsonb := '{}'::jsonb;
begin
  select * into v_recipe from recipes where id = p_id for update;
  if not found or v_recipe.revision <> p_expected_revision then
    return;
  end if;

  foreach v_key in array array['flavours', 'temperatures', 'methods', 'textures'] loop
    v_existing := coalesce(v_recipe.tags -> v_key, '[]'::jsonb);
    v_merged := v_merged || jsonb_build_object(
      v_key,
      v_existing || coalesce(
        (
          select jsonb_agg(candidate.value order by candidate.position)
          from (
            select distinct on (c.value) c.value, c.position
            from jsonb_array_elements(coalesce(p_tags -> v_key, '[]'::jsonb))
              with ordinality as c(value, position)
            order by c.value, c.position
          ) candidate
          where not v_existing @> jsonb_build_array(candidate.value)
        ),
        '[]'::jsonb
      )
    );
  end loop;

  update recipes
  set tags = v_merged,
      tags_status = 'SUCCEEDED',
      tags_attempted_at = now()
  where id = p_id
  returning * into v_recipe;

  return next v_recipe;
end;
$$;
