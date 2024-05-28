import {
  Component,
  ViewEncapsulation,
  effect,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownService } from '../services/markdown.service';

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
  contentSignal = signal<string>('');

  constructor(private mdService: MarkdownService) {
    effect(() => {
      if (this.filepath) {
        this.mdService.getParsedMdFile(this.filepath()).subscribe(content => {
          this.contentSignal.set(content);
        });
      }
    });
  }
}
