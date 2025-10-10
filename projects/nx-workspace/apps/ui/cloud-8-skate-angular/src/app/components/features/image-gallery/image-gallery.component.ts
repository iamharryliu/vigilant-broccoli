
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  imports: [],
})
export class ImageGalleryComponent {
  @Input() images!: string[];
}
