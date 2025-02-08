import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-more-page',
  templateUrl: './rules.page.html',
  imports: [MarkdownPageComponent],
})
export class RulesPageComponent {
  contentFilepath = 'assets/site-content/rules.md';
}
