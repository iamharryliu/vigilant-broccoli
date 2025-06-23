import fs from 'fs';
import { google } from 'googleapis';
import readline from 'readline';
import open from 'open';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';

// Step 1: Load your client secrets
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

// Step 2: Get or reuse the OAuth token
function getAccessToken(callback: (auth: any) => void) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
  open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving token', err);
      oAuth2Client.setCredentials(token!);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      callback(oAuth2Client);
    });
  });
}

function authorize(callback: (auth: any) => void) {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
  } else {
    getAccessToken(callback);
  }
}

// Step 3: Download Google Doc as PDF
function downloadDocAsPdf(auth: any, fileId: string, outputPath: string) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.export(
    {
      fileId,
      mimeType: 'application/pdf',
    },
    { responseType: 'stream' },
    (err, res) => {
      if (err) return console.error('API error:', err);
      const dest = fs.createWriteStream(outputPath);
      res!.data
        .on('end', () => {
          console.log('PDF downloaded to', outputPath);
        })
        .on('error', (err: any) => {
          console.error('Download error:', err);
        })
        .pipe(dest);
    },
  );
}

// Usage
const fileId = '1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU'; // Replace with your Google Docs file ID
const outputPath = 'resume.pdf';

authorize(auth => {
  downloadDocAsPdf(auth, fileId, outputPath);
});
