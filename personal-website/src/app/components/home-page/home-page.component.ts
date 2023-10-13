import { Component } from '@angular/core';
import { ConstructionWarningModule } from '@components/construction-warning/construction-warning.module';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [ConstructionWarningModule],
})
export class HomePageComponent {}
