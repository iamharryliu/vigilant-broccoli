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

  private getBaseQueryUrl() {
    return 'https://akt6kw0u.apicdn.sanity.io/v2025-03-08/data/query/production';
  }
}
