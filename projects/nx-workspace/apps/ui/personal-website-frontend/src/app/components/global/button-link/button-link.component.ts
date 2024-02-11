import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Link } from '../../../core/models/app.model';

@Component({
  standalone: true,
  selector: 'lib-button-link',
  templateUrl: './button-link.component.html',
  imports: [CommonModule, RouterModule],
})
export class ButtonLinkComponent {
  @Input() type!: 'internal' | 'external';
  @Input() link!: Link;
}
