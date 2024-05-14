import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Link, LinkType } from '../models';

@Component({
  standalone: true,
  selector: 'lib-link',
  templateUrl: './link.component.html',
  imports: [CommonModule, RouterModule],
})
export class LinkComponent {
  @Input() type!: LinkType;
  @Input() link!: Link;
  @Input() isBold = false;
  @Output() clickEmitter = new EventEmitter();

  click() {
    this.clickEmitter.emit(null);
  }
}
