import { PHOTOGRAPHY_STATE } from './photography.consts';

export type Photo = {
  path: string;
};

export type Album = {
  slug: string;
  title: string;
  photos: Photo[];
};

export type PhotographyState =
  (typeof PHOTOGRAPHY_STATE)[keyof typeof PHOTOGRAPHY_STATE];
