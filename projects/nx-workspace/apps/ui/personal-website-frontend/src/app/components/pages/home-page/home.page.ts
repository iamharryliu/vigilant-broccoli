import { Component } from '@angular/core';
import { AboutPageComponent } from '../about-page/about.page';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home.page.html',
  imports: [AboutPageComponent],
})
export class HomePageComponent {}
