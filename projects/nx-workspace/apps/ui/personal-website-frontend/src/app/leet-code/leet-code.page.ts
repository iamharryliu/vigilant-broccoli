import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LINKS } from '../core/consts/routes.const';
import { Observable } from 'rxjs';
import { AppService } from '../core/services/app.service';
import { LeetCodePageService } from './leet-code.page.service';
import {
  FolderItemComponent,
  FolderItem,
  LinkComponent,
  FileService,
} from 'general-components';
import { ActivatedRoute, Router } from '@angular/router';

const hmap = {
  go: { extension: 'go' },
  python: { extension: 'py' },
  typescript: { extension: 'ts' },
} as const;

type Language = keyof typeof hmap;

@Component({
  selector: 'app-leet-code-page',
  imports: [CommonModule, FolderItemComponent, LinkComponent],
  templateUrl: './leet-code.page.html',
  styleUrl: '../code.scss',
})
export class LeetCodePageComponent implements OnInit {
  indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.dev' };
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
    const language = this.route.snapshot.paramMap.get('language') as Language;
    const filename = this.route.snapshot.paramMap.get('filename');
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

  private getKeyFromExtension(ext: string): Language | null {
    for (const [key, value] of Object.entries(hmap)) {
      if (value.extension === ext) {
        return key as Language;
      }
    }
    return null;
  }

  selectFile(file: any): void {
    this.pageService.selectFile(file.filepath);
    this.router.navigateByUrl(
      `/grind-75/${this.getKeyFromExtension(file.name.split('.')[1])}/${
        file.name.split('.')[0]
      }`,
    );
  }

  close() {
    this.pageService.closeSelectedFile();
  }
}
