import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../core/services/file.service';
import { FolderItemComponent } from '../folder-item/folder-item.component';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { LINKS } from '../core/consts/app-route.const';
import { LinkComponent } from '../components/global/link/link.component';
import { MarkdownPageComponent } from '../components/global/markdown-page/markdown.page.component';
import { MarkdownPageService } from '../core/services/markdown-library.service';

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
export class MdLibraryComponent {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.design' };
  fileContent$: Observable<string>;

  constructor(
    private fileService: FileService,
    public appService: AppService,
    public markdownLibraryService: MarkdownPageService,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      'assets/md-library/md-library.json',
    );
  }

  close() {
    this.markdownLibraryService.closeSelectedFile();
  }
}
