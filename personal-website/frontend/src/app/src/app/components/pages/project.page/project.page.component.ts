import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';
import { LINKS } from '@app/core/consts/app-route.const';
import { Link } from '@app/core/models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';

@Component({
  selector: 'app-project.page',
  standalone: true,
  imports: [CenteredAppLayoutComponent, CommonModule],
  templateUrl: './project.page.component.html',
})
export class ProjectPageComponent {
  FRONTEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL;
  LINKS: Link[] = [
    LINKS.PERSONAL_WEBSITE,
    LINKS.REPEAT_TIMER,
    LINKS.VIBECHECK_LITE_APP,
  ];
}
