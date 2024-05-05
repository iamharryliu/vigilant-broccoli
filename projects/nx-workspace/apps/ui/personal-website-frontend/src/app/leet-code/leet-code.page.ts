import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LINKS } from '../core/consts/routes.const';
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
  styleUrl: '../md.scss',
})
export class LeetCodePageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.design' };
  fileContent$: Observable<FolderItem>;

  constructor(
    public fileService: FileService,
    public appService: AppService,
    public leetCodePageService: LeetCodePageService,
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
        const filepath = this.getFilepath(data, `${filename}.py`) as string;
        this.leetCodePageService.selectFile(filepath);
      });
    }
  }

  close() {
    this.leetCodePageService.closeSelectedFile();
  }

  private getFilepath(folder: any, filename: string): string | null {
    for (const item of folder.children) {
      console.log(filename);
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
