import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageService {

  private http = inject(HttpClient);

  getImagesByAlbumId(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${ENVIRONMENT.URLS.HEADLESS_CMS.IMAGE_ALBUMS}/${albumId}`,
    );
  }
}
