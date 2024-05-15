import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../core/services/app.service';
import { DocsMdPageService } from '../docs-md/docs-md.page.service';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { NewsLetterSubFormComponent } from '../components/features/subscribe-form/subscribe-form.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-blog-directory',
  standalone: true,
  imports: [
    MarkdownPageComponent,
    GeneralLayoutComponent,
    NewsLetterSubFormComponent,
  ],
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
    if (filename && subject === undefined) {
      this.filename = `assets/blogs/${date}-${filename}.md`;
    } else {
      this.filename = `assets/blogs/${date}-${filename}-${subject}.md`;
    }
  }
}
