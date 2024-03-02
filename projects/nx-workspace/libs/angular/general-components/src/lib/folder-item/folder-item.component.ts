import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderItem } from '../models';

@Component({
  selector: 'lib-folder-item',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss'],
})
export class FolderItemComponent {
  @Input() item!: FolderItem;
  @Output() fileEmitter = new EventEmitter();

  expanded: boolean = false;

  selectFile(file: FolderItem) {
    this.fileEmitter.emit(file);
  }

  toggle(): void {
    if (this.item.type === 'folder') {
      this.expanded = !this.expanded;
    }
  }
}
