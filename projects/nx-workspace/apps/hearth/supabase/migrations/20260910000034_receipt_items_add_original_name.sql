-- name holds the display name the user confirmed, which may be a normalized
-- translation ("garlic"). original_name always keeps the line exactly as it was
-- printed ("LÖK - VITLÖK") so a rename stays reversible after saving.
alter table receipt_items
  add column if not exists original_name text;

update receipt_items
  set original_name = name
  where original_name is null;
