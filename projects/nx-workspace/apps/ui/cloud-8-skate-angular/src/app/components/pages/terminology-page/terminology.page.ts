import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-terminology-page',
  templateUrl: './terminology.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class TerminologyPageComponent {
  contentFilepath = 'assets/site-content/skate-terminology.md';
}
