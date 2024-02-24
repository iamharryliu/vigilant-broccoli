import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../core/services/file.service';
import { FolderItemComponent } from '../folder-item/folder-item.component';

@Component({
  selector: 'app-md-library',
  standalone: true,
  imports: [CommonModule, FolderItemComponent],
  templateUrl: './md-library.component.html',
})
export class MdLibraryComponent implements OnInit {
  fileContent?: string;

  constructor(public fileService: FileService) {}

  ngOnInit(): void {
    this.fileService.getFileContent().subscribe(
      content => {
        this.fileContent = content;
        console.log('File content:', this.fileContent);
      },
      error => {
        console.error('Error fetching file:', error);
      },
    );
  }
}
