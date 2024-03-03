import { Injectable } from '@angular/core';
import { FileService } from 'general-components';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeetCodePageService {
  data!: string;
  isFileSelected = false;
  selectedContent$!: Observable<string>;

  constructor(private fileService: FileService) {}

  selectFile(filepath: string) {
    this.selectedContent$ = this.fileService.getFileAsText(
      `assets/grind-75/${filepath}`,
    );
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.data = '';
    this.isFileSelected = false;
  }
}
