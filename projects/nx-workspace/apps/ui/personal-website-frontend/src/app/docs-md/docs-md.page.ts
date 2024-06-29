import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { DOCS_MD_ROUTE, LINKS } from '../core/consts/routes.const';
import { DocsMdPageService } from './docs-md.page.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FolderItemComponent,
  FolderItem,
  LinkComponent,
  MarkdownPageComponent,
} from 'general-components';

@Component({
  selector: 'app-md-library',
  standalone: true,
  imports: [
    CommonModule,
    FolderItemComponent,
    GeneralLayoutComponent,
    LinkComponent,
    MarkdownPageComponent,
  ],
  templateUrl: './docs-md.page.html',
})
export class DocsMdPageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.design' };
  fileContent$: Observable<FolderItem>;

  constructor(
    public appService: AppService,
    public docsMdPageService: DocsMdPageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.fileContent$ = this.docsMdPageService.getFileContent();
  }

  ngOnInit(): void {
    const filename = this.route.snapshot.paramMap.get(
      'markdownFilename',
    ) as string;
    if (filename) {
      this.fileContent$.subscribe(data => {
        const filepath = this.docsMdPageService.getFilepath(
          data,
          `${filename}.md`,
        ) as string;
        this.docsMdPageService.selectFile(filepath);
      });
    }
  }

  selectFile(file: any): void {
    this.docsMdPageService.selectFile(file.filepath);
    this.router.navigateByUrl(`/docs-md/${file.name.split('.')[0]}`);
  }

  close(): void {
    this.docsMdPageService.closeSelectedFile();
    this.router.navigateByUrl(DOCS_MD_ROUTE.path as string);
  }
}
