import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private http =  inject(HttpClient);

  getFileAsText(filepath: string): Observable<string> {
    return this.http.get(filepath, { responseType: 'text' });
  }
}
