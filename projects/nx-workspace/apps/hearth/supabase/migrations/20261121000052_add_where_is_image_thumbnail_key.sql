-- Nullable so rows saved before thumbnails existed (and older app builds) keep
-- working; the list falls back to the full image when it is null.
alter table where_is_images add column thumbnail_r2_key text;
