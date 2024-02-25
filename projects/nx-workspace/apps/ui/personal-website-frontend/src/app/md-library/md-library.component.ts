import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../core/services/file.service';
import { FolderItemComponent } from '../folder-item/folder-item.component';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { ReturnTopButtonComponent } from '../components/global/return-top-button/return-top-button.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-md-library',
  standalone: true,
  imports: [
    CommonModule,
    FolderItemComponent,
    GeneralLayoutComponent,
    ReturnTopButtonComponent,
  ],
  templateUrl: './md-library.component.html',
  styleUrl: './md-library.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MdLibraryComponent {
  fileContent$: Observable<string>;

  constructor(public fileService: FileService) {
    this.fileContent$ = this.fileService.getFileContent();
  }
}
