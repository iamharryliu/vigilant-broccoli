import { Component, OnInit } from '@angular/core';
import { MarkdownPageComponent } from '../components/global/markdown-page/markdown.page.component';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../core/services/app.service';
import { DocsMdPageService } from '../docs-md/docs-md.page.service';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';

@Component({
  selector: 'app-blog-directory',
  standalone: true,
  imports: [MarkdownPageComponent, GeneralLayoutComponent],
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit {
  filename!: string;

  constructor(
    public appService: AppService,
    public markdownLibraryService: DocsMdPageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const date = this.route.snapshot.paramMap.get('date') as string;
    const subject = this.route.snapshot.paramMap.get('type') as string;
    let filename = this.route.snapshot.paramMap.get('filename') as string;
    filename = filename.replace(/\s/g, '%20');
    if (filename) {
      this.filename = `assets/blogs/${date}-${filename}-${subject}.md`;
    }
  }
}
