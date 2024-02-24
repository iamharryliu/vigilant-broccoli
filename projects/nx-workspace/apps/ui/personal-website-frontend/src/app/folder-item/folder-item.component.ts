import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../core/services/file.service';

@Component({
  selector: 'app-folder-item',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss'],
})
export class FolderItemComponent {
  @Input() item: any;

  expanded: boolean = false;

  constructor(private fileService: FileService) {}

  selectFile(path: string) {
    this.fileService.selectFile(path);
  }

  toggle(): void {
    if (this.item.type === 'folder') {
      this.expanded = !this.expanded;
    }
  }
}
