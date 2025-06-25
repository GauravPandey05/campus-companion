// Browser-compatible Cloudinary configuration
// Note: We don't import the v2 SDK here as it's Node.js only

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
}

// Cloudinary configuration for browser
const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Upload file to Cloudinary using browser-compatible fetch API
export const uploadToCloudinary = async (
  file: File, 
  folder: string = 'campus-companion'
): Promise<CloudinaryUploadResult> => {
  if (!CLOUDINARY_CONFIG.cloud_name || !CLOUDINARY_CONFIG.upload_preset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
    formData.append('folder', folder);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/auto/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve(data);
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        reject(error);
      });
  });
};

// Delete file from Cloudinary (requires server-side implementation for security)
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: Deletion should be handled server-side for security reasons
  // This is a placeholder for future server-side implementation
  console.warn('File deletion should be implemented server-side for security');
  throw new Error('File deletion not implemented - requires server-side API');
};

// Get optimized image URL for Cloudinary
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string => {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  if (!CLOUDINARY_CONFIG.cloud_name) {
    console.error('Cloudinary cloud name is not configured');
    return '';
  }
  
  let transformation = `f_${format},q_${quality}`;
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/${transformation}/${publicId}`;
};

// Export the configuration for use in other parts of the app
export const cloudinaryConfig = CLOUDINARY_CONFIG;
