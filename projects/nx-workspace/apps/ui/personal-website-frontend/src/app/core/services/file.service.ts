import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    this.getMdFile(filepath).subscribe(data => (this.selectedFileData = data));
  }
}
