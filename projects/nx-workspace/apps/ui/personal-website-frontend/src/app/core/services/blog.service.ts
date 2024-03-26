import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  titleCase(str: string): string {
    return str.split('_').join(' ');
  }
}
