import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-faq-page',
  templateUrl: './faq.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class FaqPageComponent {
  contentFilepath = 'assets/site-content/faq.md';
}
