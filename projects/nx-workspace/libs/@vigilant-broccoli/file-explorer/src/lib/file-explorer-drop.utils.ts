const PATH_SEPARATOR = '/';
const FILES_DRAG_TYPE = 'Files';
const IGNORED_FILE_NAMES = ['.DS_Store'];

export type DroppedFile = {
  // Folder path of the file inside a dropped folder ('' for a loose file).
  directory: string;
  file: File;
};

export const isFileDrag = (dataTransfer: DataTransfer) =>
  Array.from(dataTransfer.types).includes(FILES_DRAG_TYPE);

export const joinPath = (...segments: string[]) =>
  segments.filter(Boolean).join(PATH_SEPARATOR);

// `readEntries` returns at most one batch (100 in Chromium) per call, so it
// is called until it returns an empty batch.
const readAllEntries = async (reader: FileSystemDirectoryReader) => {
  const entries: FileSystemEntry[] = [];
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );
    if (batch.length === 0) return entries;
    entries.push(...batch);
  }
};

const readEntry = async (
  entry: FileSystemEntry,
  directory: string,
): Promise<DroppedFile[]> => {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject),
    );
    return IGNORED_FILE_NAMES.includes(file.name) ? [] : [{ directory, file }];
  }
  const children = await readAllEntries(
    (entry as FileSystemDirectoryEntry).createReader(),
  );
  const nested = await Promise.all(
    children.map(child => readEntry(child, joinPath(directory, entry.name))),
  );
  return nested.flat();
};

// Walks dropped folders recursively. The entries must be taken from the items
// synchronously: the browser empties the DataTransfer once the drop handler
// yields.
export const readDroppedFiles = async (
  dataTransfer: DataTransfer,
): Promise<DroppedFile[]> => {
  const entries = Array.from(dataTransfer.items)
    .map(item => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => !!entry);
  if (entries.length === 0) {
    return Array.from(dataTransfer.files).map(file => ({
      directory: '',
      file,
    }));
  }
  return (await Promise.all(entries.map(entry => readEntry(entry, '')))).flat();
};

// A folder picked with `webkitdirectory` arrives flat; `webkitRelativePath`
// ('album/sub/1.jpg') starts with the picked folder's own name.
export const readPickedFiles = (files: File[]): DroppedFile[] =>
  files
    .filter(file => !IGNORED_FILE_NAMES.includes(file.name))
    .map(file => ({
      directory: file.webkitRelativePath
        .split(PATH_SEPARATOR)
        .slice(0, -1)
        .join(PATH_SEPARATOR),
      file,
    }));

export const groupByDirectory = (dropped: DroppedFile[]) =>
  dropped.reduce(
    (groups, { directory, file }) =>
      groups.set(directory, [...(groups.get(directory) ?? []), file]),
    new Map<string, File[]>(),
  );
