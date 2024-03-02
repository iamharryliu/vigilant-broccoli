import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { LinkComponent } from '../../global/link/link.component';
import { MarkdownPageComponent } from '../../global/markdown-page/markdown.page.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    LinkComponent,
    MarkdownPageComponent,
  ],
  templateUrl: './projects.page.html',
})
export class ProjectsPageComponent {
  contentFilepath = 'assets/projects.md';
}
