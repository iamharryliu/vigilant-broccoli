import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'lib-loading-button',
  templateUrl: './loading-button.component.html',
  imports: [CommonModule],
})
export class LoadingButtonComponent {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() buttonText = 'Submit';
}
