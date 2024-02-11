import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ENVIRONMENT } from '../../../../environments/environment.development';
import { LINKS } from '../../../core/consts/app-route.const';
import { Link } from '../../../core/models/app.model';
import { ButtonLinkComponent } from '../../global/button-link/button-link.component';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';

@Component({
  selector: 'app-project.page',
  standalone: true,
  imports: [GeneralLayoutComponent, ButtonLinkComponent, CommonModule],
  templateUrl: './projects.page.html',
})
export class ProjectPageComponent {
  FRONTEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL;
  LINKS: Link[] = [LINKS.VIBECHECK_LITE_APP, LINKS.REPEAT_TIMER];
}
