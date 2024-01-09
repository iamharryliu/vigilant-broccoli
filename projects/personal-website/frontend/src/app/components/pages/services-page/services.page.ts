import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '@app/components/layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-services.page',
  templateUrl: './services.page.html',
  imports: [GeneralLayoutComponent],
})
export class ServicesPageComponent {}
