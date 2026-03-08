import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

interface SanityQueryResponse<T> {
  result: T;
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

@Injectable({
  providedIn: 'root',
})
export class Cloud8SanityService {
  private http = inject(HttpClient);

  getFaqPage(): Observable<Cloud8FaqPage | null> {
    const query = `
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

    const url = `${this.getBaseQueryUrl()}?query=${encodeURIComponent(query)}`;

    return this.http.get<SanityQueryResponse<Cloud8FaqPage | null>>(url).pipe(
      map(response => response.result ?? null),
      catchError(() => of(null)),
    );
  }

  getPlaylistsPage(): Observable<Cloud8PlaylistsPage | null> {
    const query = `
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

    const url = `${this.getBaseQueryUrl()}?query=${encodeURIComponent(query)}`;

    return this.http
      .get<SanityQueryResponse<Cloud8PlaylistsPage | null>>(url)
      .pipe(
        map(response => response.result ?? null),
        catchError(() => of(null)),
      );
  }

  getGalleryAlbums(): Observable<Cloud8GalleryAlbumSummary[]> {
    const query = `
      *[_type == "galleryAlbum"] | order(date desc, _updatedAt desc){
        _id,
        name,
        "slug": slug.current,
        description,
        date,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt,
        "coverImageUrl": images[0].asset->url,
        "imageCount": count(images)
      }
    `;

    const url = `${this.getBaseQueryUrl()}?query=${encodeURIComponent(query)}`;

    return this.http
      .get<SanityQueryResponse<Cloud8GalleryAlbumSummary[] | null>>(url)
      .pipe(
        map(response => response.result ?? []),
        catchError(() => of([])),
      );
  }

  getGalleryAlbum(slug: string): Observable<Cloud8GalleryAlbumDetail | null> {
    const query = `
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
          "url": asset->url,
          "createdAt": asset->_createdAt,
          "updatedAt": asset->_updatedAt
        }
      }
    `;

    const url = `${this.getBaseQueryUrl()}?query=${encodeURIComponent(
      query,
    )}&$slug=${encodeURIComponent(JSON.stringify(slug))}`;

    return this.http
      .get<SanityQueryResponse<Cloud8GalleryAlbumDetail | null>>(url)
      .pipe(
        map(response => response.result ?? null),
        catchError(() => of(null)),
      );
  }

  private getBaseQueryUrl() {
    return 'https://akt6kw0u.apicdn.sanity.io/v2025-03-08/data/query/production';
  }
}
