export const PHOTOGRAPHY_STATE = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
} as const;

export const PUBLIC_PHOTOGRAPHY_PATH = '/api/public/photography';
export const ALBUMS_PATH = `${PUBLIC_PHOTOGRAPHY_PATH}/albums`;
export const PHOTOS_PATH = `${PUBLIC_PHOTOGRAPHY_PATH}/photos`;

export const SKELETON_ALBUM_COUNT = 6;
