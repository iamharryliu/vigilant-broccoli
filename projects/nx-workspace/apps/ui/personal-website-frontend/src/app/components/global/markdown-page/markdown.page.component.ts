import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MarkdownService } from 'general-components';

@Component({
  selector: 'app-markdown-page',
  standalone: true,
  imports: [CommonModule],
  styleUrl: '../../../md.scss',
  templateUrl: './markdown.page.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MarkdownPageComponent implements OnChanges {
  @Input() filepath = '';
  content$?: Observable<string>;
  constructor(private mdService: MarkdownService) {}

  ngOnChanges(): void {
    this.content$ = this.mdService.getParsedMdFile(this.filepath);
  }
}
