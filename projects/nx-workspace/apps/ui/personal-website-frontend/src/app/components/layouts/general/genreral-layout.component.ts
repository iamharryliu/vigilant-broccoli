
import { Component, Input } from '@angular/core';
import { LINKS } from '../../../core/consts/routes.const';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../features/footer/footer.component';
import { NavbarSectionComponent } from '../../features/navbar-section/navbar-section.component';
import { ENVIRONMENT } from '../../../../environments/environment';
import { ToggleDarkThemeButtonComponent } from '../../features/toggle-dark-mode-button/toggle-dark-mode-button.component';

@Component({
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [
    NavbarSectionComponent,
    FooterComponent,
    RouterModule,
    ToggleDarkThemeButtonComponent
],
  styles: [
    '#profile-picture {width: 120px; height: 120px; border-radius: 50%;}',
  ],
})
export class GeneralLayoutComponent {
  @Input() hasContactForm = true;
  @Input() hasSubscribeForm = true;
  LINKS = LINKS;
  ENVIRONMENT = ENVIRONMENT;
}
