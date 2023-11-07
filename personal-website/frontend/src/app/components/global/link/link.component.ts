import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-link',
  templateUrl: './link.component.html',
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class LinkComponent {
  @Input() link!: {
    text: string;
    isExternalLink: boolean;
    url: string;
    target?: string;
  };
  @Input() isBold = false;
}
