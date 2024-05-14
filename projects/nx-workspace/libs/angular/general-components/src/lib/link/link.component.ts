import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINK_TYPE, Link, LinkType } from '../models';

@Component({
  standalone: true,
  selector: 'lib-link',
  templateUrl: './link.component.html',
  imports: [CommonModule, RouterModule],
})
export class LinkComponent {
  @Input() type: LinkType = LINK_TYPE.EXTERNAL;
  @Input() link!: Link;
  @Input() isBold = false;
  @Output() clickEmitter = new EventEmitter();

  click() {
    this.clickEmitter.emit(null);
  }
}
