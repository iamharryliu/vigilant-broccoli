import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private http: HttpClient) {}

  // TODO: Implement selecting albumId
  getImagesByAlbumId(albumId: string): Observable<any> {
    console.log(albumId);
    return this.http.get<any>('http://127.0.0.1:5000/images');
  }
}
