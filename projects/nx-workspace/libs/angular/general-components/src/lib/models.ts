export const LINK_TYPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
} as const;
type LINK_TYPE_KEYS = keyof typeof LINK_TYPE;
export type LinkType = (typeof LINK_TYPE)[LINK_TYPE_KEYS];

export interface Link {
  url: {
    internal?: string;
    external?: string;
  };
  text: string;
  type?: LinkType;
}

export interface FolderItem {
  name: string;
  type: 'folder' | 'file';
  filepath: string;
  children?: FolderItem[];
}
