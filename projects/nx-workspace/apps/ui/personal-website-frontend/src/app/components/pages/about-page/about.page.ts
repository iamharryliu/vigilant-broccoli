import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { ContactComponent } from '../../features/contact/contact.component';
import { NewsLetterSubFormComponent } from '../../features/subscribe-form/subscribe-form.component';
import { FileService } from '../../../core/services/file.service';
import { Observable } from 'rxjs';
import { MarkdownPageComponent } from '../../global/markdown-page/markdown.page.component';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about.page.html',
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    ContactComponent,
    NewsLetterSubFormComponent,
    MarkdownPageComponent,
  ],
})
export class AboutPageComponent {
  contentFilepath = 'assets/about.md';
  text$: Observable<string>;
  constructor(private fileService: FileService) {
    this.text$ = this.fileService.parseMdFile('assets/about.md');
  }
}
