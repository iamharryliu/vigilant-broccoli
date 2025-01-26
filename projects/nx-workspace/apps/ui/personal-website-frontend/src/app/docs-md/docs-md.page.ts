import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  FileService,
} from 'general-components';

@Component({
  selector: 'app-md-library',
  standalone: true,
  imports: [
    CommonModule,
    FolderItemComponent,
    LinkComponent,
    MarkdownPageComponent,
  ],
  templateUrl: './docs-md.page.html',
})
export class DocsMdPageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.dev' };
  fileContent$: Observable<FolderItem>;

  constructor(
    public appService: AppService,
    private fileService: FileService,
    public pageService: DocsMdPageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.fileContent$ = this.pageService.getFileContent();
  }

  ngOnInit(): void {
    const filename = this.route.snapshot.paramMap.get(
      'markdownFilename',
    ) as string;
    if (filename) {
      this.fileContent$.subscribe(data => {
        const filepath = this.fileService.getFilepath(
          data,
          `${filename}.md`,
        ) as string;
        this.pageService.selectFile(filepath);
      });
    }
  }

  selectFile(file?: FolderItem): void {
    let pathUrl = `/${DOCS_MD_ROUTE.path}`;
    if (file) {
      pathUrl += `/${file.name.split('.')[0]}`;
      this.pageService.selectFile(file.filepath);
    } else {
      this.pageService.selectFile();
    }
    this.router.navigateByUrl(pathUrl);
  }

  close(): void {
    this.pageService.closeSelectedFile();
    this.router.navigateByUrl(DOCS_MD_ROUTE.path as string);
  }
}
