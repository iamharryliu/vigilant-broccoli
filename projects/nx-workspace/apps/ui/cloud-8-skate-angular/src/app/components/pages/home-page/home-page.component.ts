import { Component } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  EXTERNAL_LINKS = EXTERNAL_LINKS;
}
