import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about.page.html',
  imports: [CommonModule, GeneralLayoutComponent],
})
export class AboutPageComponent {}
