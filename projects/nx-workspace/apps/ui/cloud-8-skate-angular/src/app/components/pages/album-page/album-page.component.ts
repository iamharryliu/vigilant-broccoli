import { Component, OnInit } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';
import { Observable, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from '../../../services/images.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  imports: [ImageGalleryComponent, CommonModule],
})
export class AlbumPageComponent implements OnInit {
  images$!: Observable<string[]>;
  albumName!: string;

  constructor(
    private route: ActivatedRoute,
    private imageService: ImageService,
  ) {}

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
