import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  effect,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownService } from '../services/markdown.service';
import { PrintService } from '../services/print.service';

@Component({
  selector: 'lib-markdown-page',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './md.scss',
  templateUrl: './markdown.page.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MarkdownPageComponent implements OnInit, OnDestroy {
  filepath = input('');
  contentSignal = signal<string>('');
  @ViewChild('printSection') printSection!: ElementRef;

  constructor(
    private mdService: MarkdownService,
    private printService: PrintService,
  ) {
    effect(() => {
      if (this.filepath) {
        this.mdService.getParsedMdFile(this.filepath()).subscribe(content => {
          this.contentSignal.set(content);
        });
      }
    });
  }

  ngOnInit(): void {
    window.addEventListener('keydown', this.handlePrintShortcut.bind(this));
  }

  @HostListener('window:beforeunload', ['$event'])
  ngOnDestroy() {
    window.removeEventListener('keydown', this.handlePrintShortcut.bind(this));
  }

  handlePrintShortcut(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      this.printBlockContent();
    }
  }

  printBlockContent() {
    const printContent = this.printSection.nativeElement.outerHTML;
    this.printService.print(printContent);
  }
}
