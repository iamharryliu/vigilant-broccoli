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
  templateUrl: './md-library.component.html',
})
export class MdLibraryComponent {
  indexLink = LINKS.INDEX_PAGE;
  fileContent$: Observable<string>;

  constructor(public fileService: FileService, public appService: AppService) {
    this.fileContent$ = this.fileService.getFileContent();
  }

  close() {
    this.fileService.closeSelectedFile();
  }
}
