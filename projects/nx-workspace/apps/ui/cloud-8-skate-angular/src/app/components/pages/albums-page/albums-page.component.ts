import { Component } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-albums-page',
  templateUrl: './albums-page.component.html',
  imports: [ImageGalleryComponent, CommonModule],
})
export class AlbumsPageComponent {
  albums!: string[];
  constructor(private http: HttpClient) {
    this.getPosts().subscribe(res => (this.albums = res));
  }

  private getPosts(): Observable<any> {
    return this.http.get<any>(ENVIRONMENT.URLS.HEADLESS_CMS.IMAGE_ALBUMS);
  }
}
