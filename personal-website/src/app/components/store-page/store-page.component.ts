import { Component } from '@angular/core';
import { ConstructionWarningModule } from '@app/components/construction-warning/construction-warning.module';

@Component({
  standalone: true,
  selector: 'app-store-page',
  templateUrl: './store-page.component.html',
  imports: [ConstructionWarningModule],
})
export class StorePageComponent {}
