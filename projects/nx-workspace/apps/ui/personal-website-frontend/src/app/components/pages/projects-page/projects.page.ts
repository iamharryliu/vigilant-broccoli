import { Component } from '@angular/core';

import { MarkdownPageComponent } from 'general-components';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';

@Component({
  selector: 'app-projects-page',
  imports: [MarkdownPageComponent, GeneralLayoutComponent],
  templateUrl: './projects.page.html',
})
export class ProjectsPageComponent {
  contentFilepath = 'assets/site-content/projects.md';
}
