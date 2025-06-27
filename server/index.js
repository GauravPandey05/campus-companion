const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  dest: 'temp-uploads/',
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Load Google Drive credentials
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const credentials = require(CREDENTIALS_PATH);
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// The folder ID where all files will be uploaded
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Configure Google authentication
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES
});

// Create Drive client
const drive = google.drive({ version: 'v3', auth });

// Helper function to detect MIME type based on file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  try {
    // Read the file from temp storage
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    
    // Determine subfolder (notes, assignments, etc.)
    const subfolderName = req.body.folder || 'notes';
    
    // Check if subfolder exists, create if not
    let subfolderId = DRIVE_FOLDER_ID; // Default to main folder
    
    try {
      const folderQuery = await drive.files.list({
        q: `name='${subfolderName}' and mimeType='application/vnd.google-apps.folder' and '${DRIVE_FOLDER_ID}' in parents and trashed=false`,
        fields: 'files(id, name)'
      });
      
      if (folderQuery.data.files.length > 0) {
        subfolderId = folderQuery.data.files[0].id;
      } else {
        // Create subfolder
        const folderMetadata = {
          name: subfolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [DRIVE_FOLDER_ID]
        };
        
        const folder = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });
        
        subfolderId = folder.data.id;
      }
    } catch (folderError) {
      console.error('Folder creation error:', folderError);
      // Continue with main folder if subfolder creation fails
    }
    
    // Create file metadata
    const fileMetadata = {
      name: fileName,
      parents: [subfolderId]
    };
    
    // Create media stream
    const media = {
      mimeType: getMimeType(fileName),
      body: fs.createReadStream(filePath)
    };
    
    // Upload the file
    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,mimeType,size,webViewLink,webContentLink'
    });
    
    const file = uploadResponse.data;
    
    // Make file publicly accessible
    await drive.permissions.create({
      fileId: file.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Delete temp file
    fs.unlinkSync(filePath);
    
    // Return file details
    res.json({
      fileId: file.id,
      fileName: file.name,
      mimeType: file.mimeType,
      fileSize: file.size,
      webViewLink: file.webViewLink, // View in Google Drive
      webContentLink: file.webContentLink, // Direct download link
      embedLink: `https://drive.google.com/file/d/${file.id}/preview` // For embedding in iframes
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to Google Drive' });
  }
});

// Get file info endpoint
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,webViewLink,webContentLink'
    });
    
    res.json({
      fileId: file.data.id,
      fileName: file.data.name,
      mimeType: file.data.mimeType,
      fileSize: file.data.size,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink,
      embedLink: `https://drive.google.com/file/d/${file.data.id}/preview`
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file information' });
  }
});

// Delete file endpoint
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    await drive.files.delete({ fileId });
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});