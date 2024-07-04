import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LINKS } from '../core/consts/routes.const';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { LeetCodePageService } from './leet-code.page.service';
import {
  FolderItemComponent,
  FolderItem,
  LinkComponent,
  FileService,
  MarkdownPageComponent,
} from 'general-components';
import { ActivatedRoute } from '@angular/router';

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
  styleUrl: '../code.scss',
})
export class LeetCodePageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.design' };
  fileContent$: Observable<FolderItem>;

  constructor(
    public fileService: FileService,
    public appService: AppService,
    public pageService: LeetCodePageService,
    private route: ActivatedRoute,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      'assets/grind-75/grind-75.json',
    );
  }

  ngOnInit(): void {
    const filename = this.route.snapshot.paramMap.get('filename') as string;
    if (filename) {
      this.fileContent$.subscribe(data => {
        const filepath = this.fileService.getFilepath(data, `${filename}.py`);
        this.pageService.selectFile(filepath);
      });
    }
  }

  close() {
    this.pageService.closeSelectedFile();
  }
}
