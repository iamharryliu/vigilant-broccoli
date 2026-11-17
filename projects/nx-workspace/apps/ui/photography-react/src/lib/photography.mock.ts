import { Album } from './photography.types';

// Dev-only: `?mock` swaps the API for these albums so the layout can be
// tried with many photos. Picsum serves a stable random photo per seed.
export const MOCK_QUERY_PARAM = 'mock';

const MOCK_ALBUM_NAMES = [
  'Summer Trip',
  'City Nights',
  'Mountain Hikes',
  'Portraits',
  'Panoramas',
  'Street Food',
  'Coastline',
  'Winter Cabin',
  'Night Market',
  'Old Town',
  'Road Trip',
  'Garden',
  'Concerts',
  'Desert',
];
const MOCK_SIZES = [
  '1200/800',
  '800/1200',
  '1000/1000',
  '1600/900',
  '900/1600',
  '1600/600',
];
const MOCK_MIN_PHOTOS = 6;
const MOCK_PHOTO_SPREAD = 18;

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export const MOCK_ALBUMS: Album[] = MOCK_ALBUM_NAMES.map((title, album) => {
  const slug = toSlug(title);
  const count = MOCK_MIN_PHOTOS + ((album * 7) % MOCK_PHOTO_SPREAD);
  return {
    slug,
    title,
    photos: Array.from({ length: count }, (_, photo) => ({
      path: `https://picsum.photos/seed/${slug}-${photo}/${
        MOCK_SIZES[(album + photo) % MOCK_SIZES.length]
      }`,
    })),
  };
});

export const isMockMode = () =>
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).has(MOCK_QUERY_PARAM);
