import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FolderItem } from '../models';
import { HyphenatedToTitleCasePipe } from '../pipes/hyphenated-to-titlecase.pipe';

@Component({
  selector: 'lib-folder-item',
  imports: [HyphenatedToTitleCasePipe],
  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss'],
})
export class FolderItemComponent implements OnInit {
  @Input() item!: FolderItem;
  @Input() filepath?: string;
  @Input() isTitleCase = false;
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
