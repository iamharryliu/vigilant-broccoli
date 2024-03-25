import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NavbarComponent } from '../../features/navbar/navbar.component';
import { LINKS } from '../../../core/consts/app-route.const';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [CommonModule, NavbarComponent, RouterModule],
  styles: [
    '#profile-picture {width: 120px; height: 120px; border-radius: 50%;}',
  ],
})
export class GeneralLayoutComponent {
  @Input() hasContactForm = true;
  @Input() hasSubscribeForm = true;
  LINKS = LINKS;
}
