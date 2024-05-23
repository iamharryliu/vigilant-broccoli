import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  isFileSelected = true;
  selectedFile? = 'assets/docs-md.md';

  selectFile(filepath: string) {
    this.selectedFile = `assets/md-library/notes/${filepath}`;
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.selectedFile = undefined;
    this.isFileSelected = false;
  }
}
