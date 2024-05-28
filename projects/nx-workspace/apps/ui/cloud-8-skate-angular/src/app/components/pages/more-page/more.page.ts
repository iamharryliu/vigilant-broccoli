import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-more-page',
  templateUrl: './more.page.html',
  imports: [MarkdownPageComponent],
})
export class MorePageComponent {
  contentFilepath = 'assets/site-content/more.md';
}
