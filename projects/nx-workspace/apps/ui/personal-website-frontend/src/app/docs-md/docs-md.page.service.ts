import { Injectable } from '@angular/core';
import { FileService, FolderItem } from 'general-components';
import { Observable } from 'rxjs';

const DEFAULT_MD_FILE = 'assets/docs-md.md';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  selectedFile = DEFAULT_MD_FILE;
  isFileSelected = true;
  constructor(private fileService: FileService) {}

  getFileContent(): Observable<FolderItem> {
    return this.fileService.getFolderStructure(
      'assets/md-library/md-library.json',
    );
  }

  selectFile(filepath: string) {
    this.selectedFile = `assets/md-library/notes/${filepath}`;
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.selectedFile = DEFAULT_MD_FILE;
    this.isFileSelected = false;
  }

  getFilepath(folder: any, filename: string): string | null {
    for (const item of folder.children) {
      if (item.type === 'file' && item.name === filename) {
        return item.filepath;
      }

      if (item.type === 'folder') {
        const result = this.getFilepath(item, filename);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }
}
