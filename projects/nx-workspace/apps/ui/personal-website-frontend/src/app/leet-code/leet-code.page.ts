import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LINKS } from '../core/consts/app-route.const';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { MarkdownPageComponent } from '../components/global/markdown-page/markdown.page.component';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { LeetCodePageService } from './leet-code.page.service';
import {
  FolderItemComponent,
  FolderItem,
  LinkComponent,
  FileService,
} from 'general-components';

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
  templateUrl: './leet-code.page.html',
  styleUrl: '../md.scss',
})
export class LeetCodePageComponent {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.design' };
  fileContent$: Observable<FolderItem>;

  constructor(
    public fileService: FileService,
    public appService: AppService,
    public leetCodePageService: LeetCodePageService,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      // TODO: fix file structure
      'assets/grind-75/grind-75.json',
    );
  }

  close() {
    this.leetCodePageService.closeSelectedFile();
  }
}
