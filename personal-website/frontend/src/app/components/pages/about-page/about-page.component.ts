import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  imports: [TranslateModule, CommonModule, GeneralLayoutComponent],
})
export class AboutPageComponent {}
