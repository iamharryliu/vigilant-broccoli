import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import {
  FolderItemComponent,
  FolderItem,
} from 'general-components';

@Component({
  selector: 'app-file-search',
  imports: [CommonModule, FolderItemComponent, FormsModule],
  templateUrl: './file-search.component.html',
  standalone: true,
})
export class FileSearchComponent implements OnInit {
  @Input() fileContent$!: Observable<FolderItem>;
  @Input() selectedFilepath?: string;
  @Input() placeholder = 'Search files...';
  @Input() isTitleCase = false;
  // Function to determine if a file should be included in search results
  @Input() fileFilter: (filename: string) => boolean = () => true;

  @Output() fileSelected = new EventEmitter<FolderItem>();

  filteredFileContent$!: Observable<FolderItem>;
  searchQuery = '';
  searchResults: FolderItem[] = [];

  ngOnInit(): void {
    this.filteredFileContent$ = this.fileContent$;
  }

  // Filter file/folder structure based on search query
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFileContent$ = this.fileContent$;
      this.searchResults = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();

    // Get flat list of matching files for display
    this.fileContent$.subscribe(rootFolder => {
      this.searchResults = this.getAllFiles(rootFolder)
        .filter(file => file.name.toLowerCase().includes(query));
    });

    this.filteredFileContent$ = this.fileContent$.pipe(
      map(rootFolder => this.filterFolderItems(rootFolder, query))
    );
  }

  // Recursively filter folder items to find matching files
  private filterFolderItems(item: FolderItem, query: string): FolderItem {
    // If it's a file, check if it matches the search query
    if (item.type === 'file') {
      const matchesSearch = item.name.toLowerCase().includes(query) &&
                           this.fileFilter(item.name);
      return matchesSearch ? item : { ...item, children: [] };
    }

    // If it's a folder, recursively filter its children
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children
        .map(child => this.filterFolderItems(child, query))
        .filter(child => {
          // Keep folders that have children or files that match
          if (child.type === 'folder') {
            return child.children && child.children.length > 0;
          }
          return child.name.toLowerCase().includes(query) && this.fileFilter(child.name);
        });

      return {
        ...item,
        children: filteredChildren
      };
    }

    return item;
  }

  // Clear search and reset to show all files
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  // Recursively get all files from folder structure
  private getAllFiles(item: FolderItem): FolderItem[] {
    const files: FolderItem[] = [];

    if (item.type === 'file' && this.fileFilter(item.name)) {
      files.push(item);
    }

    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        files.push(...this.getAllFiles(child));
      });
    }

    return files;
  }

  // Emit file selection event
  selectFile(file: FolderItem): void {
    this.fileSelected.emit(file);
  }
}
