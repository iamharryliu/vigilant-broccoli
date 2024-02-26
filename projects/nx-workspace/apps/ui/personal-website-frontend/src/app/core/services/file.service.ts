import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { MarkdownService } from '@prettydamntired/test-lib';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  selectedFileData?: string;
  isFileSelected = false;

  constructor(private http: HttpClient) {}

  getFileContent(): Observable<any> {
    return this.http.get('assets/md-library/md-library.json');
  }

  getMdFile(filepath: string): Observable<any> {
    return this.http.get(`assets/md-library/notes/${filepath}`, {
      responseType: 'text',
    });
  }

  selectFile(filepath: string): void {
    this.getMdFile(filepath)
      .pipe(
        tap(async data => {
          this.selectedFileData = await MarkdownService.parse(data);
          this.isFileSelected = true;
        }),
      )
      .subscribe();
  }

  closeSelectedFile() {
    this.selectedFileData = undefined;
    this.isFileSelected = false;
  }
}
