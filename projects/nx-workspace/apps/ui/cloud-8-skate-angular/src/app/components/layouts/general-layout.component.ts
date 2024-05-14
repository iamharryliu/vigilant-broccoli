import { Component } from '@angular/core';
import { NavbarComponent } from '../features/navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [NavbarComponent],
})
export class GeneralLayoutComponent {}
