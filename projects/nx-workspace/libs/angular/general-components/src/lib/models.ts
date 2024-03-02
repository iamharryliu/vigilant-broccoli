export interface FolderItem {
  name: string;
  type: 'folder' | 'file';
  filepath: string;
  children?: FolderItem[];
}
