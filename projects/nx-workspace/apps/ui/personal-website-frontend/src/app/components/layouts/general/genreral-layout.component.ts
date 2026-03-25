import { Component } from '@angular/core';
import { LINKS } from '../../../core/consts/routes.const';
import { RouterModule } from '@angular/router';
import { NavbarSectionComponent } from '../../features/navbar-section/navbar-section.component';
import { ENVIRONMENT } from '../../../../environments/environment';
import { ToggleDarkThemeButtonComponent } from '../../features/toggle-dark-mode-button/toggle-dark-mode-button.component';
import { ProfileCardComponent } from '../../features/profile-card/profile-card.component';

@Component({
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [
    NavbarSectionComponent,
    RouterModule,
    ToggleDarkThemeButtonComponent,
    ProfileCardComponent,
  ],
})
export class GeneralLayoutComponent {
  LINKS = LINKS;
  ENVIRONMENT = ENVIRONMENT;
}
