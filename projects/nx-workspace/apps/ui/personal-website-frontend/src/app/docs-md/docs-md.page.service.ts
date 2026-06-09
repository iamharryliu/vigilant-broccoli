import { inject, Injectable } from '@angular/core';
import {
  FileService,
  FILE_STRUCTURE_PATHS,
  FolderItem,
} from 'general-components';
import { Observable } from 'rxjs';

const DEFAULT_MD_FILE = 'assets/docs-md.md';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  isFileSelected = true;
  selectedFilepath = '';

  private fileService = inject(FileService);

  getFileContent(): Observable<FolderItem> {
    return this.fileService.getFolderStructure(FILE_STRUCTURE_PATHS.MD_LIBRARY);
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
