import { ENVIRONMENT } from '../environments/environment';
import { ALBUMS_PATH, PHOTOS_PATH } from './photography.consts';
import { Album } from './photography.types';

export const photoUrl = (path: string) =>
  `${ENVIRONMENT.API_URL}${PHOTOS_PATH}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

export const fetchAlbums = async (signal: AbortSignal): Promise<Album[]> => {
  const response = await fetch(`${ENVIRONMENT.API_URL}${ALBUMS_PATH}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Albums request failed: ${response.status}`);
  }
  const { albums } = (await response.json()) as { albums: Album[] };
  if (!Array.isArray(albums)) {
    throw new Error('Albums response is malformed');
  }
  return albums;
};
