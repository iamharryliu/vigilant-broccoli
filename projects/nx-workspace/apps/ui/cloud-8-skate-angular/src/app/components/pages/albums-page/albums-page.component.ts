import { Component } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { INTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ImageAlbum } from '@prettydamntired/personal-website-lib';

@Component({
  selector: 'app-albums-page',
  templateUrl: './albums-page.component.html',
  imports: [ImageGalleryComponent, CommonModule, RouterModule],
})
export class AlbumsPageComponent {
  albums!: ImageAlbum[];
  LINKS = INTERNAL_LINKS;
  constructor(private http: HttpClient) {
    this.getPosts().subscribe(res => (this.albums = res));
  }

  private getPosts(): Observable<any> {
    return this.http.get<any>(ENVIRONMENT.URLS.HEADLESS_CMS.IMAGE_ALBUMS);
  }
}
