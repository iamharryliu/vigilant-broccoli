import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NavbarComponent } from '../../features/navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [CommonModule, NavbarComponent],
})
export class GeneralLayoutComponent {
  @Input() hasContactForm = true;
  @Input() hasSubscribeForm = true;
}
