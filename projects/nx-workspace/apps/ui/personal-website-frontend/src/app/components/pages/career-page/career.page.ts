import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';

@Component({
  selector: 'app-career-page',
  templateUrl: './career.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class CareerPageComponent {
  contentFilepath = 'assets/site-content/career.md';
}
