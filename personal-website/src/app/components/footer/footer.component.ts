import { Component } from '@angular/core';
import { AppRoutingModule } from '@app/app-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [TranslateModule, AppRoutingModule],
})
export class FooterComponent {}
