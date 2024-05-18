import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-more-page',
  templateUrl: './more.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class MorePageComponent {
  contentFilepath = 'assets/site-content/more.md';
}
