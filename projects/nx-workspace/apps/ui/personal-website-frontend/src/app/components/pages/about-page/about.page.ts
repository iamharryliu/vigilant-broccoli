
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-about-page',
  templateUrl: './about.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class AboutPageComponent {
  contentFilepath = 'assets/site-content/about.md';
}
