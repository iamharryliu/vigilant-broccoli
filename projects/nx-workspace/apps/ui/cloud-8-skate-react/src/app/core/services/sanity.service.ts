const SANITY_QUERY_URL =
  'https://akt6kw0u.apicdn.sanity.io/v2025-03-08/data/query/production';

interface SanityQueryResponse<T> {
  result: T | null;
}

export interface Cloud8FaqLink {
  label: string;
  url: string;
}

export interface Cloud8FaqItem {
  _key?: string;
  question: string;
  answer: string;
  links?: Cloud8FaqLink[];
}

export interface Cloud8FaqPage {
  title: string;
  intro?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  faqItems: Cloud8FaqItem[];
}

export interface Cloud8PlaylistItem {
  _key?: string;
  title: string;
  url: string;
  curator?: string;
  description?: string;
}

export interface Cloud8PlaylistsPage {
  title: string;
  intro?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  playlistItems: Cloud8PlaylistItem[];
}

export interface Cloud8GalleryImage {
  _key?: string;
  alt?: string;
  url: string;
  url2x: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cloud8GalleryAlbumSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  coverImageUrl?: string;
  imageCount: number;
}

export interface Cloud8GalleryAlbumDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  images: Cloud8GalleryImage[];
}

const FAQ_PAGE_QUERY = `
  *[_type == "faqPage"] | order(_updatedAt desc)[0]{
    title,
    intro,
    seoTitle,
    seoDescription,
    seoKeywords,
    faqItems[]{
      _key,
      question,
      answer,
      links[]{
        label,
        url
      }
    }
  }
`;

const PLAYLISTS_PAGE_QUERY = `
  *[_type == "playlistsPage"] | order(_updatedAt desc)[0]{
    title,
    intro,
    seoTitle,
    seoDescription,
    seoKeywords,
    playlistItems[]{
      _key,
      title,
      url,
      curator,
      description
    }
  }
`;

const GALLERY_ALBUMS_QUERY = `
  *[_type == "galleryAlbum"] | order(date desc, _updatedAt desc){
    _id,
    name,
    "slug": slug.current,
    description,
    date,
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
    "coverImageUrl": images[0].asset->url + "?w=400&auto=format&q=75",
    "imageCount": count(images)
  }
`;

const GALLERY_ALBUM_QUERY = `
  *[_type == "galleryAlbum" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    description,
    date,
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
    images[]{
      _key,
      alt,
      "url": asset->url + "?w=800&auto=format&q=75",
      "url2x": asset->url + "?w=1600&auto=format&q=75",
      "createdAt": asset->_createdAt,
      "updatedAt": asset->_updatedAt
    }
  }
`;

// Resolves to null on any failure so pages can render their "not available"
// fallback, matching the Angular service's catchError(() => of(null)).
const querySanity = async <T>(
  query: string,
  params: Record<string, string> = {},
): Promise<T | null> => {
  const search = new URLSearchParams({ query });
  Object.entries(params).forEach(([key, value]) =>
    search.set(`$${key}`, JSON.stringify(value)),
  );
  const response = await fetch(`${SANITY_QUERY_URL}?${search}`).catch(
    () => null,
  );
  if (!response?.ok) return null;
  const body: SanityQueryResponse<T> | null = await response
    .json()
    .catch(() => null);
  return body?.result ?? null;
};

export const getFaqPage = () => querySanity<Cloud8FaqPage>(FAQ_PAGE_QUERY);

export const getPlaylistsPage = () =>
  querySanity<Cloud8PlaylistsPage>(PLAYLISTS_PAGE_QUERY);

export const getGalleryAlbums = async () =>
  (await querySanity<Cloud8GalleryAlbumSummary[]>(GALLERY_ALBUMS_QUERY)) ?? [];

export const getGalleryAlbum = (slug: string) =>
  querySanity<Cloud8GalleryAlbumDetail>(GALLERY_ALBUM_QUERY, { slug });
