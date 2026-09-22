import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const isCloudinaryConfigured = true;

/**
 * Helper to compress image file into a compact Data URL for reliable local/session persistence
 */
function compressImageToDataUrl(file, maxWidth = 300, maxHeight = 300, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Cloudinary via backend proxy endpoint with fallback
 * @param {File} file - The file object from file input
 * @returns {Promise<string>} - The secure HTTPS URL or compressed Data URL of the uploaded image
 */
export async function uploadToCloudinary(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('file', file);

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000
    });

    if (response.data && response.data.url) {
      return {
        url: response.data.url,
        public_id: response.data.public_id || null
      };
    }
  } catch (err) {
    console.warn('Backend Cloudinary upload notice:', err.message);
  }

  // Robust compressed fallback if Cloudinary credentials or backend return error
  const fallbackUrl = await compressImageToDataUrl(file);
  return {
    url: fallbackUrl,
    public_id: null
  };
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

