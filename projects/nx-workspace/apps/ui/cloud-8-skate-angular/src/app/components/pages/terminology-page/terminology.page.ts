import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-terminology-page',
  templateUrl: './terminology.page.html',
  imports: [MarkdownPageComponent],
})
export class TerminologyPageComponent {
  contentFilepath = 'assets/site-content/skate-terminology.md';
}
