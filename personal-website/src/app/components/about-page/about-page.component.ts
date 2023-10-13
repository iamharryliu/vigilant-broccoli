import { Component } from '@angular/core';
import { ConstructionWarningModule } from '@components/construction-warning/construction-warning.module';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  imports: [ConstructionWarningModule],
})
export class AboutPageComponent {}
