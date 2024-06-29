import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderItem } from '../models';

@Component({
  selector: 'lib-folder-item',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss'],
})
export class FolderItemComponent implements OnInit {
  @Input() item!: FolderItem;
  @Input() filepath?: string;
  @Output() fileEmitter = new EventEmitter();
  expanded = false;
  subpath?: string;

  ngOnInit(): void {
    if (this.filepath) {
      const dir = this.filepath.split('/')[0];
      if (this.item.name === dir) {
        this.subpath = this.filepath.split('/').slice(1).join('/');
        this.expanded = true;
      }
    }
  }

  selectFile(file: FolderItem): void {
    this.fileEmitter.emit(file);
  }

  toggle(): void {
    if (this.item.type === 'folder') {
      this.expanded = !this.expanded;
    }
  }
}
