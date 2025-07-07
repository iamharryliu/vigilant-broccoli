import axios from 'axios';
import { google } from 'googleapis';
import 'dotenv/config';

const FILE_URL =
  'https://github.com/iamharryliu/vigilant-broccoli/archive/refs/heads/main.zip';
const FILENAME = 'vigilant-broccoli.zip';
const DRIVE_FOLDER_ID = '1TPpjg8xHc8adDebFPJIf554xKMRGnwcK';

async function uploadStreamToDrive(
  fileUrl: string,
  filename: string,
): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Check if the file already exists in the folder
  const query = `name='${filename}' and '${DRIVE_FOLDER_ID}' in parents and trashed = false`;
  const listRes = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const existingFile = listRes.data.files?.[0];

  // Stream download from URL
  const response = await axios.get(fileUrl, { responseType: 'stream' });

  const media = {
    mimeType: 'application/zip',
    body: response.data,
  };

  if (existingFile) {
    // Update existing file
    const updateRes = await drive.files.update({
      fileId: existingFile.id as string,
      media,
    });

    console.log(`Replaced file: ${filename}, ID: ${updateRes.data.id}`);
  } else {
    // Create new file
    const fileMetadata = {
      name: filename,
      parents: [DRIVE_FOLDER_ID],
    };

    const createRes = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    console.log(`Uploaded new file: ${filename}, ID: ${createRes.data.id}`);
  }
}

async function main() {
  try {
    console.log('Streaming upload to Google Drive...');
    await uploadStreamToDrive(FILE_URL, FILENAME);
    console.log('Upload complete.');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
