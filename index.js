import { google } from 'googleapis';
import { client_email, private_key } from './credentials.json';
const scopes = [
  'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
  client_email, null,
  private_key, scopes
);
const drive = google.drive({ version: "v3", auth });

drive.files.list({}, (err, res) => {
  if (err) throw err;
  const files = res.data.files;
  if (files.length) {
  files.map((file) => {
    console.log(file);
  });
  } else {
    console.log('No files found');
  }
});
