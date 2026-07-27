import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { FileSystemUtils } from './file-system.utils';

const zipFolder = async (
  sourceFolder: string,
  zipFilePath = '',
): Promise<string> => {
  await FileSystemUtils.makedirectory(path.dirname(zipFilePath));
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sourceFolder)) {
      return reject(new Error(`Source folder does not exist: ${sourceFolder}`));
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

export const ArchiveUtils = {
  zipFolder,
};
