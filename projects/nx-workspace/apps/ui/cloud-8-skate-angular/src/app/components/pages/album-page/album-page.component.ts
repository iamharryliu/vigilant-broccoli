import { Component, inject, OnInit } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';
import { Observable, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from '../../../services/images.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  imports: [ImageGalleryComponent, CommonModule],
})
export class AlbumPageComponent implements OnInit {
  images$!: Observable<string[]>;
  albumName!: string;
  
  private route = inject(ActivatedRoute);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    this.images$ = this.route.paramMap.pipe(
      switchMap(params => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const albumName = params.get('albumName')!;
        this.albumName = albumName;
        return this.imageService.getImagesByAlbumId(albumName);
      }),
    );
  }
}
