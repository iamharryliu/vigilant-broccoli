import { Component, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-more-page',
  templateUrl: './more.page.html',
  imports: [MarkdownPageComponent],
})
export class MorePageComponent {
  contentFilepath = 'assets/site-content/more.md';
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.contentFilepath = `assets/site-content/${id}.md`;
      }
    });
  }
}
