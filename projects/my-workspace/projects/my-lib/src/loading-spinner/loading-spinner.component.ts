import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'lib-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['../tailwind.css'],
})
export class LoadingSpinnerComponent {
  @Input() header!: string;
  @Input() message!: string;
}
