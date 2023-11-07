import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-button-link',
  templateUrl: './button-link.component.html',
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class ButtonLinkComponent {
  @Input() link!: {
    text: string;
    url: string;
    target?: string;
    isExternalLink?: boolean;
  };
}
