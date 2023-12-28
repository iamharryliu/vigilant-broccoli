import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '@app/components/layouts/general/genreral-layout.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-services.page',
  templateUrl: './services.page.html',
  imports: [GeneralLayoutComponent, TranslateModule],
})
export class ServicesPageComponent {}
