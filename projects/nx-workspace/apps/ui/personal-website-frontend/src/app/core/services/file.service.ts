import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  selectedFileData?: string;

  constructor(private http: HttpClient) {}

  getFileContent(): Observable<any> {
    return this.http.get('assets/notes.json');
  }

  getMdFile(filepath: string): Observable<any> {
    return this.http.get(`assets/notes/${filepath}`, { responseType: 'text' });
  }

  selectFile(filepath: string): void {
    const markdownParser = marked.setOptions({});
    this.getMdFile(filepath)
      .pipe(
        tap(
          async data =>
            (this.selectedFileData = await markdownParser.parse(data)),
        ),
      )
      .subscribe();
  }
}
