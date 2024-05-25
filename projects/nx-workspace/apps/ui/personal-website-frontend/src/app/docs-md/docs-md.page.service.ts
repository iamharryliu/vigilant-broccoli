import { Injectable } from '@angular/core';

const DEFAULT_MD_FILE = 'assets/docs-md.md';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  selectedFile = DEFAULT_MD_FILE;
  isFileSelected = true;

  selectFile(filepath: string) {
    this.selectedFile = `assets/md-library/notes/${filepath}`;
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.selectedFile = DEFAULT_MD_FILE;
    this.isFileSelected = false;
  }
}
