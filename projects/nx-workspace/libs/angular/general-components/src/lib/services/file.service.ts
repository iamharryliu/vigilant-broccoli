import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FolderItem } from '../models';

const FILE_STRUCTURE_PATHS = {
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
  private http = inject(HttpClient);

  getFolderStructure(
    fileStructureFilepath: FileStructureFilepath,
  ): Observable<FolderItem> {
    return this.http.get<FolderItem>(fileStructureFilepath);
  }

  getFilepath(folder: any, filename: string): string {
    for (const item of folder.children) {
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

    return '';
  }
}
