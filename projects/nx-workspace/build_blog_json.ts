import * as fs from 'fs';

const directoryPath = './apps/ui/personal-website-frontend/src/assets/blogs';

function getFilenames(directoryPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

async function writeFilenamesToJson(
  directoryPath: string,
  outputFilePath: string,
): Promise<void> {
  try {
    const files = await getFilenames(directoryPath);
    const jsonContent = JSON.stringify(files);
    fs.writeFile(outputFilePath, jsonContent, err => {
      if (err) {
        console.error('Error writing to JSON file:', err);
      } else {
        console.log('Filenames have been written to', outputFilePath);
      }
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

const outputFilePath =
  './apps/ui/personal-website-frontend/src/assets/blogs.json';

writeFilenamesToJson(directoryPath, outputFilePath);
