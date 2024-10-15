import {
  Component,
  ViewEncapsulation,
  effect,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownService } from '../services/markdown.service';
import { ScrollService } from '../services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'lib-markdown-page',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './md.scss',
  templateUrl: './markdown.page.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MarkdownPageComponent {
  filepath = input('');
  contentSignal = signal<string | SafeHtml>('');
  isTrustedContent = input(false);

  constructor(
    private mdService: MarkdownService,
    private scrollService: ScrollService,
    private sanitizer: DomSanitizer,
  ) {
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
