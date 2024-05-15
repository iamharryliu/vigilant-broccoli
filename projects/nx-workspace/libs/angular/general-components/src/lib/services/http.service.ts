import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  getFileAsText(filepath: string): Observable<string> {
    return this.http.get(filepath, { responseType: 'text' });
  }
}
