import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, exhaustMap, from } from 'rxjs';
import { MarkdownService } from '@prettydamntired/test-lib';

// TODO: mv
export const FILE_STRUCTURE_PATHS = {
  MD_LIBRARY: 'assets/md-library/md-library.json',
  LEET_CODE: 'assets/grind-75/grind-75.json',
} as const;
type FILE_STRUCTURE_PATHS_KEYS = keyof typeof FILE_STRUCTURE_PATHS;
type FileStructureFilepath =
  (typeof FILE_STRUCTURE_PATHS)[FILE_STRUCTURE_PATHS_KEYS];

@Injectable({
  providedIn: 'root',
})
export class FileService {
  isFileSelected = false;
  selectedFile?: string;
  data!: string;

  constructor(private http: HttpClient) {}

  getFolderStructure(
    fileStructureFilepath: FileStructureFilepath,
  ): Observable<any> {
    return this.http.get(fileStructureFilepath);
  }

  getFileAsText(filepath: string): Observable<string> {
    return this.http.get(filepath, { responseType: 'text' });
  }

  parseMdFile(filepath: string): Observable<string> {
    return this.getFileAsText(filepath).pipe(
      exhaustMap(data => from(MarkdownService.parse(data))),
    );
  }

  selectFile(filepath: string): void {
    if (filepath.endsWith('.md')) {
      this.selectedFile = `assets/md-library/notes/${filepath}`;
      this.isFileSelected = true;
    }
    if (filepath.endsWith('.py')) {
      this.getFileAsText(`assets/grind-75/${filepath}`).subscribe(
        data => (this.data = data),
      );
    }
  }

  closeSelectedFile(): void {
    this.selectedFile = undefined;
    this.isFileSelected = false;
  }
}
