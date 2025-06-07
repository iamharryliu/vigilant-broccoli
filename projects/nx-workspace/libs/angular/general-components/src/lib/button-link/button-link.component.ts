import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Link } from '../models';

@Component({
  selector: 'lib-button-link',
  templateUrl: './button-link.component.html',
  imports: [CommonModule, RouterModule],
})
export class ButtonLinkComponent {
  @Input() type!: 'internal' | 'external';
  @Input() link!: Link;
}
