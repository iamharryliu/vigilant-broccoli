import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, exhaustMap, from } from 'rxjs';
import { MarkdownService } from '@prettydamntired/test-lib';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  isFileSelected = false;
  selectedFile?: string;

  constructor(private http: HttpClient) {}

  getFileContent(): Observable<any> {
    return this.http.get('assets/md-library/md-library.json');
  }

  getFileAsText(filepath: string) {
    return this.http.get(filepath, { responseType: 'text' });
  }

  parseMdFile(filepath: string): Observable<string> {
    return this.getFileAsText(filepath).pipe(
      exhaustMap(data => from(MarkdownService.parse(data))),
    );
  }

  selectFile(filepath: string): void {
    this.selectedFile = `assets/md-library/notes/${filepath}`;
    this.isFileSelected = true;
  }

  closeSelectedFile() {
    this.selectedFile = undefined;
    this.isFileSelected = false;
  }
}
