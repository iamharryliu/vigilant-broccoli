import { Component, Input } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';

@Component({
  standalone: true,
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  imports: [ImageGalleryComponent],
})
export class AlbumPageComponent {
  @Input() images!: string[];
}
