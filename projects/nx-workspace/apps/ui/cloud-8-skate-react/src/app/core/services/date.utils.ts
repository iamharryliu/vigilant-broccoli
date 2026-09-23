const ALBUM_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

// Sanity album dates are plain `YYYY-MM-DD`; `new Date()` would read them as
// UTC midnight and show the previous day in Toronto, so build a local date.
export const formatAlbumDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return ALBUM_DATE_FORMAT.format(new Date(year, month - 1, day));
};
