import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

const DEFAULT_SUBMIT_BUTTON_TEXT = 'Submit';

@Component({
  standalone: true,
  selector: 'lib-loading-button',
  templateUrl: './loading-button.component.html',
  imports: [CommonModule],
})
export class LoadingButtonComponent {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() buttonText = DEFAULT_SUBMIT_BUTTON_TEXT;
}
