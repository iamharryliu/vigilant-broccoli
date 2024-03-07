import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocsMdPageService {
  isFileSelected = false;
  selectedFile?: string;

  selectFile(filepath: string) {
    this.selectedFile = `assets/md-library/notes/${filepath}`;
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.selectedFile = undefined;
    this.isFileSelected = false;
  }
}
