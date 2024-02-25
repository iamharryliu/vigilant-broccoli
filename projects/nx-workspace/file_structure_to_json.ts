// TODO: move this file
import fs from 'fs';
import path from 'path';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  filepath: string;
  children?: FileNode[];
}

function folderToJson(folderPath: string, rootPath: string): FileNode {
  const result: FileNode = {
    name: path.basename(folderPath),
    type: 'folder',
    filepath: path.relative(rootPath, folderPath),
    children: [],
  };

  const items: string[] = fs.readdirSync(folderPath);

  for (const item of items) {
    const itemPath = path.join(folderPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      result.children?.push(folderToJson(itemPath, rootPath));
    } else {
      result.children?.push({
        name: item,
        type: 'file',
        filepath: path.relative(rootPath, itemPath),
      });
    }
  }

  return result;
}

function saveJson(data: FileNode, outputFile: string): void {
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
}

if (process.argv.length !== 4) {
  console.log('Usage: ts-node script.ts <folderPath> <outputFile>');
  process.exit(1);
}

const folderPath: string = process.argv[2];
const outputFile: string = process.argv[3];

if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
  const data: FileNode = folderToJson(folderPath, folderPath);
  saveJson(data, outputFile);
  console.log(`Folder structure has been converted to ${outputFile}`);
} else {
  console.log('Invalid folder path. Please provide a valid folder path.');
}
