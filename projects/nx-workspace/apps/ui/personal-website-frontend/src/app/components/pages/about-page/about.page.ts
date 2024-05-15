import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about.page.html',
  imports: [CommonModule, GeneralLayoutComponent, MarkdownPageComponent],
})
export class AboutPageComponent {
  contentFilepath = 'assets/site-content/about.md';
}
