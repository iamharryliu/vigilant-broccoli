import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';
import { ENVIRONMENT } from 'src/environments/environment';

@Component({
  selector: 'app-project.page',
  standalone: true,
  imports: [CenteredAppLayoutComponent, CommonModule],
  templateUrl: './project.page.component.html',
})
export class ProjectPageComponent {
  FRONTEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL;
  LINKS = [
    { url: this.FRONTEND_URL + '/projects/repeat-timer', text: 'Repeat Timer' },
    {
      url: this.FRONTEND_URL + '/projects/vibecheck-lite/app',
      text: 'Vibecheck Lite',
    },
  ];
}
