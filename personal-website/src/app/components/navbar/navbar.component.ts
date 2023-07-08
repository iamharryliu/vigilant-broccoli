import { Component } from '@angular/core';
import { APP_PATH } from '@app/app-route.const';
import { AppRoutingModule } from '@app/app-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [TranslateModule, AppRoutingModule],
})
export class NavbarComponent {
  public PATH = {
    HOME: APP_PATH.INDEX,
    ABOUT: APP_PATH.ABOUT,
    CONTACT: APP_PATH.CONTACT,
  };
}
