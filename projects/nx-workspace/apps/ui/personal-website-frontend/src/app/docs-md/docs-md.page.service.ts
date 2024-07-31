import { Injectable } from '@angular/core';
import { FileService, FolderItem } from 'general-components';
import { Observable } from 'rxjs';

const DEFAULT_MD_FILE = 'assets/docs-md.md';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  isFileSelected = true;
  selectedFilepath = '';

  constructor(private fileService: FileService) {}

  getFileContent(): Observable<FolderItem> {
    return this.fileService.getFolderStructure(
      'assets/md-library/md-library.json',
    );
  }

  get getFilepath(): string {
    if (!this.selectedFilepath) {
      return DEFAULT_MD_FILE;
    }
    return `assets/md-library/notes/${this.selectedFilepath}`;
  }

  selectFile(filepath = '') {
    this.selectedFilepath = filepath;
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.isFileSelected = false;
  }
}
