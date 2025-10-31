import {
  Component,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { MarkdownService } from '../services/markdown.service';
import { ScrollService } from '../services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'lib-markdown-page',
  imports: [],
  styleUrl: './md.scss',
  templateUrl: './markdown.page.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MarkdownPageComponent {
  filepath = input('');
  contentSignal = signal<string | SafeHtml>('');
  isTrustedContent = input(false);

  private mdService = inject(MarkdownService);
  private scrollService = inject(ScrollService);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      if (this.filepath) {
        this.mdService.getParsedMdFile(this.filepath()).subscribe(content => {
          const htmlContent = this.isTrustedContent()
            ? this.sanitizer.bypassSecurityTrustHtml(content)
            : content;
          this.contentSignal.set(htmlContent);
          this.scrollService.scrollToAnchor();
        });
      }
    });
  }
}
