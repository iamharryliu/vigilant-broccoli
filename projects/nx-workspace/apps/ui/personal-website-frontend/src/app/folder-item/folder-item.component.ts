import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-folder-item',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss'],
})
export class FolderItemComponent {
  @Input() item: any;
  @Output() fileEmitter = new EventEmitter();

  expanded: boolean = false;

  selectFile(path: string) {
    this.fileEmitter.emit(path);
  }

  toggle(): void {
    if (this.item.type === 'folder') {
      this.expanded = !this.expanded;
    }
  }
}
