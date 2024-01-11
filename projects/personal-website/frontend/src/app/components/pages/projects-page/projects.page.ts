import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '@app/components/layouts/general/genreral-layout.component';
import { LINKS } from '@app/core/consts/app-route.const';
import { Link } from '@app/core/models/app.model';
import { ButtonLinkComponent } from '@prettydamntired/my-lib';
import { ENVIRONMENT } from 'src/environments/environment';

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
