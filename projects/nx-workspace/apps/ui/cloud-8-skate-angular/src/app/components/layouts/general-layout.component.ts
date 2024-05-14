import { Component } from '@angular/core';
import { NavbarSectionComponent } from '../features/navbar-section/navbar-section.component';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [NavbarSectionComponent],
})
export class GeneralLayoutComponent {}
