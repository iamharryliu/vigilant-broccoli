import { Component } from '@angular/core';
import { ConstructionWarningModule } from '@components/construction-warning/construction-warning.module';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ConstructionWarningModule],
})
export class ContactPageComponent {}
