import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { DOCS_MD_ROUTE, LINKS } from '../core/consts/routes.const';
import { DocsMdPageService } from './docs-md.page.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSearchComponent } from '../components/features/file-search/file-search.component';
import {
  FolderItem,
  LinkComponent,
  MarkdownPageComponent,
  FileService,
} from 'general-components';

@Component({
  selector: 'app-md-library',
  imports: [
    CommonModule,
    LinkComponent,
    MarkdownPageComponent,
    FileSearchComponent,
  ],
  templateUrl: './docs-md.page.html',
})
export class DocsMdPageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.dev' };
  fileContent$: Observable<FolderItem>;

    public appService= inject(AppService);
    private fileService= inject(FileService);
    public pageService= inject(DocsMdPageService);
    private router= inject(Router);
    private route= inject(ActivatedRoute);

  constructor(
  ) {
    this.fileContent$ = this.pageService.getFileContent();
  }

  // Filter function to only show .md files
  markdownFileFilter = (filename: string): boolean => {
    return filename.endsWith('.md');
  };

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
