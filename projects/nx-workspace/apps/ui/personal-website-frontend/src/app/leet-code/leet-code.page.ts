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
import { ActivatedRoute, Router } from '@angular/router';

const hmap = {
  go: { extension: 'go' },
  python: { extension: 'py' },
  typescript: { extension: 'ts' },
};

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
    private router: Router,
  ) {
    this.fileContent$ = this.fileService.getFolderStructure(
      'assets/grind-75/grind-75.json',
    );
  }

  ngOnInit(): void {
    // TODO: refactor typing
    const language = this.route.snapshot.paramMap.get('language') as
      | 'python'
      | 'go'
      | 'typescript';
    const filename = this.route.snapshot.paramMap.get('filename') as string;
    if (filename) {
      const extension = hmap[language].extension;
      this.fileContent$.subscribe(data => {
        const filepath = this.fileService.getFilepath(
          data,
          `${filename}.${extension}`,
        );
        this.pageService.selectFile(filepath);
      });
    }
  }

  // TODO: find a better way to do this
  private getKeyFromExtension(ext: any) {
    for (const key in hmap) {
      if (hmap[key as 'python' | 'go' | 'typescript'].extension === ext) {
        return key;
      }
    }
    return null;
  }

  selectFile(file: any): void {
    this.pageService.selectFile(file.filepath);
    this.router.navigateByUrl(
      `/grind-75/${this.getKeyFromExtension(file.name.split('.')[1])}/${file.name.split('.')[0]}`,
    );
  }

  close() {
    this.pageService.closeSelectedFile();
  }
}
