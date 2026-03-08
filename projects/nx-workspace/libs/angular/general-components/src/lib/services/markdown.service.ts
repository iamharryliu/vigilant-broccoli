import { inject, Injectable } from '@angular/core';
import { marked } from 'marked';
import { Observable, exhaustMap, from } from 'rxjs';
import { HttpService } from './http.service';

const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  const titleAttribute = title ? ` title="${title}"` : '';

  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttribute}>${text}</a>`;
};

const DEFAULT_MARKDOWN_OPTIONS = { breaks: true };

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  static markdownParser = marked.setOptions({
    ...DEFAULT_MARKDOWN_OPTIONS,
    renderer,
  });

  private httpService = inject(HttpService);

  static async parse(data: string): Promise<string> {
    return this.markdownParser.parse(data);
  }

  getParsedMdFile(filepath: string): Observable<string> {
    return this.httpService
      .getFileAsText(filepath)
      .pipe(exhaustMap(data => from(MarkdownService.parse(data))));
  }
}
