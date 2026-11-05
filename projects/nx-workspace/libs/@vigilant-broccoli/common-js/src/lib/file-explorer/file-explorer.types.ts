export const FILE_ENTRY_KIND = {
  FILE: 'file',
  FOLDER: 'folder',
} as const;

type FileEntryBase = {
  name: string;
  // Relative to the explorer root, e.g. `Acme/cover-letter.pdf`.
  path: string;
  modified: string;
  // Creation time (ISO), for lists ordered by when an item first appeared.
  created: string;
};

export type FileEntry =
  | (FileEntryBase & { kind: typeof FILE_ENTRY_KIND.FILE; size: number })
  | (FileEntryBase & {
      kind: typeof FILE_ENTRY_KIND.FOLDER;
      itemCount: number;
    });
