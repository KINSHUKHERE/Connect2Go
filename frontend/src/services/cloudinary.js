import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  cloudName && 
  uploadPreset && 
  !cloudName.includes('your-cloud')
);

/**
 * Upload an image file directly to Cloudinary
 * @param {File} file - The file object from file input
 * @param {string} folder - Target folder in Cloudinary (e.g. 'connect2go/avatars')
 * @returns {Promise<string>} - The secure HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(file, folder = 'connect2go') {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Returning local object URL as fallback.');
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await axios.post(endpoint, formData);
  return response.data.secure_url;
}

/**
 * Generate an optimized Cloudinary delivery URL with transformation parameters
 * @param {string} url - Original Cloudinary image URL
 * @param {string} transformations - e.g. 'c_fill,g_face,w_300,h_300,f_auto,q_auto'
 */
export function getOptimizedImageUrl(url, transformations = 'f_auto,q_auto') {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transformations}/`);
}
