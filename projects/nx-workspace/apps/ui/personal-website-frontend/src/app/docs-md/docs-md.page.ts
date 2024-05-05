import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { DOCS_MD_ROUTE, LINKS } from '../core/consts/routes.const';
import { MarkdownPageComponent } from '../components/global/markdown-page/markdown.page.component';
import { DocsMdPageService } from './docs-md.page.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FolderItemComponent,
  FolderItem,
  LinkComponent,
  FileService,
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
    private fileService: FileService,
    public appService: AppService,
    public markdownLibraryService: DocsMdPageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      'assets/md-library/md-library.json',
    );
  }

  ngOnInit(): void {
    const filename = this.route.snapshot.paramMap.get(
      'markdownFilename',
    ) as string;
    if (filename) {
      this.fileContent$.subscribe(data => {
        const filepath = this.getFilepath(data, `${filename}.md`) as string;
        this.markdownLibraryService.selectFile(filepath);
      });
    }
  }

  selectFile(file: any) {
    this.markdownLibraryService.selectFile(file.filepath);
    this.router.navigateByUrl(`/docs-md/${file.name.split('.')[0]}`);
  }

  close() {
    this.markdownLibraryService.closeSelectedFile();
    this.router.navigateByUrl(DOCS_MD_ROUTE.path as string);
  }

  private getFilepath(folder: any, filename: string): string | null {
    for (const item of folder.children) {
      if (item.type === 'file' && item.name === filename) {
        return item.filepath;
      }

      if (item.type === 'folder') {
        const result = this.getFilepath(item, filename);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }
}
