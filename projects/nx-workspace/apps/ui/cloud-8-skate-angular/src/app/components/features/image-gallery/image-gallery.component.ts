import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  imports: [CommonModule],
})
export class ImageGalleryComponent {
  @Input() images!: string[];
}
