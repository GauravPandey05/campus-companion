import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface DriveFileResponse {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  webViewLink: string;
  webContentLink: string;
  embedLink: string;
}

export interface CloudinaryCompatibleResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at?: string;
}

// Upload a file to Google Drive
export const uploadFile = async (
  file: File, 
  folder: string = 'notes'
): Promise<CloudinaryCompatibleResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await axios.post<DriveFileResponse>(
      `${API_BASE_URL}/upload`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const data = response.data;
    
    // Convert to Cloudinary-compatible format for easier integration
    return {
      public_id: data.fileId,
      secure_url: data.webViewLink,
      original_filename: data.fileName,
      bytes: data.fileSize,
      format: data.mimeType.split('/')[1] || 'unknown',
      resource_type: data.mimeType.includes('image') ? 'image' : 'raw',
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
};

// Get file information
export const getFileInfo = async (fileId: string): Promise<DriveFileResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw new Error('Failed to get file information');
  }
};

// Delete a file
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/files/${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

// Get view URL (compatible with your existing code)
export const getViewUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

// Get download URL
export const getDownloadUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};