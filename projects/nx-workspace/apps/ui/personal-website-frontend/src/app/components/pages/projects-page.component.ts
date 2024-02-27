import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLayoutComponent } from '../layouts/general/genreral-layout.component';
import { LinkComponent } from '../global/link/link.component';
import { LINKS } from '../../core/consts/app-route.const';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, GeneralLayoutComponent, LinkComponent],
  templateUrl: './projects-page.component.html',
})
export class ProjectsPageComponent {
  LINKS = LINKS;
}
