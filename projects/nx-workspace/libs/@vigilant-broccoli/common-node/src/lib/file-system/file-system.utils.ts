import fs, { existsSync, readdirSync, statSync } from 'fs';
import path, { join } from 'path';
import crypto from 'crypto';
import { homedir } from 'os';
import { TMP_PATH } from './file-system.consts';

const writeFile = async (filepath: string, content: string): Promise<void> => {
  await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
  await fs.promises.writeFile(filepath, content);
};

const appendFile = async (filepath: string, content: string): Promise<void> => {
  await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
  await fs.promises.appendFile(filepath, content, 'utf-8');
};

const makedirectory = async (directoryPath: string): Promise<void> => {
  await fs.promises.mkdir(directoryPath, { recursive: true });
};

const deletePath = async (paths: string | string[]): Promise<void> => {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  await Promise.all(
    pathArray.map(path =>
      fs.promises.rm(path, { recursive: true, force: true }),
    ),
  );
};

const getFromFilepath = <T>(filepath: string, structure: T): T => {
  try {
    const cache = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
    return cache as T;
  } catch {
    console.warn(`Filepath '${filepath}' not found.`);
    return structure;
  }
};

const getListFromFilepath = <T>(filepath: string): T[] => {
  return getFromFilepath(filepath, [] as T[]);
};

const getObjectFromFilepath = <T>(filepath: string): T => {
  return getFromFilepath(filepath, {} as T);
};

const writeJSON = async (
  filepath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
  isPretty = false,
): Promise<void> => {
  await writeFile(filepath, JSON.stringify(object, null, isPretty ? 2 : 0));
};

const checkFilePath = async <T>(filePath: string): Promise<T | false> => {
  const resolvedPath = path.resolve(filePath);
  try {
    const data = JSON.parse(
      fs.readFileSync(resolvedPath, { encoding: 'utf-8' }),
    );
    return data;
  } catch {
    return false;
  }
};

const generateTmpFilepath = (): string => {
  return path.resolve(TMP_PATH, crypto.randomBytes(16).toString('hex'));
};

const expandHomePath = (filepath: string): string => {
  if (filepath.startsWith('~/')) {
    return filepath.replace('~', homedir());
  }
  return filepath;
};

export function getFilenamesFromDir(
  dirPath: string,
  recursive = false,
): string[] {
  const files: string[] = [];

  if (!existsSync(dirPath)) {
    FileSystemUtils.makedirectory(dirPath);
    return files;
  }

  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (recursive) {
        files.push(...getFilenamesFromDir(fullPath, true));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

export const FileSystemUtils = {
  // CREATE
  writeFile,
  makedirectory,
  writeJSON,
  generateTmpFilepath,
  // READ
  checkFilePath,
  getFilenamesFromDir,
  getListFromFilepath,
  getObjectFromFilepath,
  // UPDATE
  // DELETE
  deletePath,
  appendFile,
  // PATH
  expandHomePath,
};
