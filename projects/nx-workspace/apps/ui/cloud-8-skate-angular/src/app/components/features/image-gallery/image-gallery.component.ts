import { Component, Input } from '@angular/core';
import { Cloud8GalleryImage } from '../../../services/cloud8-sanity.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  imports: [],
})
export class ImageGalleryComponent {
  @Input() images!: Cloud8GalleryImage[];
}
