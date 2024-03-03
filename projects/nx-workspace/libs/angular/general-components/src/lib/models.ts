export interface Link {
  url: {
    internal?: string;
    external: string;
  };
  text: string;
}

export interface FolderItem {
  name: string;
  type: 'folder' | 'file';
  filepath: string;
  children?: FolderItem[];
}
