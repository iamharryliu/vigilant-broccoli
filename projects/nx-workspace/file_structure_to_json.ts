import fs from 'fs';
import path from 'path';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  filepath: string;
  children?: FileNode[];
}

const ignorePatterns: RegExp[] = [/__pycache__/];

function shouldIgnore(itemPath: string): boolean {
  return ignorePatterns.some(pattern => pattern.test(itemPath));
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

    // Skip ignored files/folders
    if (shouldIgnore(itemPath)) {
      continue;
    }

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
  // Sort Files
  if (result.children) result.children = sortFiles(result.children);
  return result;
}

function sortFiles(files: FileNode[]): FileNode[] {
  return files.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'folder' ? -1 : 1;
  });
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
