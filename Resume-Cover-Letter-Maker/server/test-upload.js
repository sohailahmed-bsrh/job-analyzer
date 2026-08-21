import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  // Create a dummy PDF file
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Title (Dummy CV)\n>>\nendobj\n%EOF');

  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(dummyPdfPath)], { type: 'application/pdf' });
  formData.append('file', fileBlob, 'dummy.pdf');

  try {
    const response = await fetch('http://localhost:5186/api/v1/candidate/resume-upload', {
      method: 'POST',
      headers: {
        'X-Workspace-Id': 'test-workspace-id'
      },
      body: formData
    });

    const text = await response.text();
    console.log('Status:', response.status);
    try {
      console.log('Response:', JSON.parse(text));
    } catch {
      console.log('Response (text):', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    fs.unlinkSync(dummyPdfPath);
  }
}

testUpload();
