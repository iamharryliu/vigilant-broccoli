import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { Observable, exhaustMap, from } from 'rxjs';
import { HttpService } from './http.service';

const DEFAULT_MARKDOWN_OPTIONS = { breaks: true };

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  static markdownParser = marked.setOptions(DEFAULT_MARKDOWN_OPTIONS);

  constructor(private httpService: HttpService) {}

  static async parse(data: string): Promise<string> {
    return this.markdownParser.parse(data);
  }

  getParsedMdFile(filepath: string): Observable<string> {
    return this.httpService
      .getFileAsText(filepath)
      .pipe(exhaustMap(data => from(MarkdownService.parse(data))));
  }
}
