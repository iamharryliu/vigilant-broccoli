import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LINKS } from '../core/consts/app-route.const';
import { Observable } from 'rxjs';
import { FileService } from '../core/services/file.service';
import { AppService } from '../core/services/app.service';
import { LinkComponent } from '../components/global/link/link.component';
import { MarkdownPageComponent } from '../components/global/markdown-page/markdown.page.component';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { FolderItemComponent } from '../folder-item/folder-item.component';
import { LeetCodePageService } from '../core/services/leet-code.service';

@Component({
  selector: 'app-leet-code-page',
  standalone: true,
  imports: [
    CommonModule,
    FolderItemComponent,
    GeneralLayoutComponent,
    LinkComponent,
    MarkdownPageComponent,
  ],
  templateUrl: './leet-code-page.component.html',
  styleUrl: '../md.scss',
})
export class LeetCodePageComponent {
  indexLink = LINKS.INDEX_PAGE;
  fileContent$: Observable<string>;

  constructor(
    public fileService: FileService,
    public appService: AppService,
    public leetCodePageService: LeetCodePageService,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      'assets/grind-75/grind-75.json',
    );
  }

  close() {
    this.leetCodePageService.closeSelectedFile();
  }
}
