import { Component } from '@angular/core';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  standalone: true,
  selector: 'app-link-tree-page',
  templateUrl: './link-tree-page.component.html',
  imports: [CenteredAppLayoutComponent],
})
export class LinkTreePageComponent {}
