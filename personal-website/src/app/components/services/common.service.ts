import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  subscribeToNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/email-alerts`, { email: email });
  }
}
