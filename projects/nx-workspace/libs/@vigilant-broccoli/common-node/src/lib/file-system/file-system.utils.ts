import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import archiver from 'archiver';
import { Hashmap } from './file-system.models';
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

const zipFolder = async (
  sourceFolder: string,
  zipFilePath = '',
): Promise<string> => {
  await makedirectory(path.dirname(zipFilePath));
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sourceFolder)) {
      return reject(new Error('Source folder does not exist'));
    }
    const savePath = zipFilePath ? zipFilePath : `${sourceFolder}.zip`;
    const output = fs.createWriteStream(savePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => {
      console.info(
        `Zip file created: ${savePath} (${archive.pointer()} total bytes)`,
      );
      resolve(savePath);
    });
    archive.on('error', err => {
      reject(err);
    });
    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
};

const deletePath = async (path: string): Promise<void> => {
  await fs.promises.rm(path, { recursive: true, force: true });
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

const getObjectFromFilepath = <T>(filepath: string): Hashmap<T> => {
  return getFromFilepath(filepath, {} as Hashmap<T>);
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

const getBasename = (filepath: string): string => {
  return path.basename(filepath);
};

const generateTmpFilepath = (): string => {
  return path.resolve(TMP_PATH, crypto.randomBytes(16).toString('hex'));
};

export const FileSystemUtils = {
  makedirectory,
  writeFile,
  appendFile,
  zipFolder,
  deletePath,
  getListFromFilepath,
  getObjectFromFilepath,
  writeJSON,
  checkFilePath,
  getBasename,
  generateTmpFilepath,
};
