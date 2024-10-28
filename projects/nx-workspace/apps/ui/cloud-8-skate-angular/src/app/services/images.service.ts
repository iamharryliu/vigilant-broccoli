import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private http: HttpClient) {}

  getImagesByAlbumId(albumId: string): Observable<any> {
    return this.http
      .get<any>(`${ENVIRONMENT.URLS.HEADLESS_CMS.IMAGE_ALBUMS}/${albumId}`)
      .pipe(
        map(response =>
          response.map(
            (filename: string) => `https://bucket.cloud8skate.com/${filename}`,
          ),
        ),
      );
    // ;
  }
}
