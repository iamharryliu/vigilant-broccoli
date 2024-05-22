import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINK_TYPE, Link, LinkType, TEXT_SIZE, TextSize } from '../models';

@Component({
  standalone: true,
  selector: 'lib-link',
  templateUrl: './link.component.html',
  imports: [CommonModule, RouterModule],
})
export class LinkComponent {
  @Input() type?: LinkType = LINK_TYPE.EXTERNAL;
  @Input() textSize?: TextSize = TEXT_SIZE.DEFAULT;
  @Input() link!: Link;
  @Input() isLight = false;
  @Input() isBold = false;
  @Output() clickEmitter = new EventEmitter<void>();

  click() {
    this.clickEmitter.emit();
  }
}
