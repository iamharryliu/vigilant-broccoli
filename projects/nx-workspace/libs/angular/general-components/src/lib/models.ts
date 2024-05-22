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

// Tailwind
export const TEXT_SIZE = {
  SMALL: 'sm',
  DEFAULT: 'base',
  LARGE: 'lg',
} as const;
type TEXT_SIZE_KEYS = keyof typeof TEXT_SIZE;
export type TextSize = (typeof TEXT_SIZE)[TEXT_SIZE_KEYS];
