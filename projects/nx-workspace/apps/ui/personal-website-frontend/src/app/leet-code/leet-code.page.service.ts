import { Injectable } from '@angular/core';
import { HttpService } from 'general-components';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeetCodePageService {
  data!: string;
  isFileSelected = false;
  selectedContent$!: Observable<string>;

  constructor(private httpService: HttpService) {}

  selectFile(filepath: string) {
    this.selectedContent$ = this.httpService.getFileAsText(
      `assets/grind-75/grind-75/${filepath}`,
    );
    this.isFileSelected = true;
  }

  closeSelectedFile(): void {
    this.data = '';
    this.isFileSelected = false;
  }
}
