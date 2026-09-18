/**
 * Image Utilities & Fallbacks for Connect2Go
 * Ensures 100% of images load gracefully with zero broken thumbnails.
 */

export const CATEGORY_IMAGES = {
  Sports: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
  Fitness: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
  Gaming: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
  Study: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
  Food: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  Travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
  Music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  Others: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&auto=format&fit=crop&q=80',
};

export const categoryBanners = CATEGORY_IMAGES;

// SVG Data URL Fallback for Activity Cards if external networks block Unsplash
export const FALLBACK_ACTIVITY_BANNER = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2322C55E%22%20stop-opacity%3D%220.85%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2315803D%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23ffffff%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EConnect2Go%20Activity%3C%2Ftext%3E%3C%2Fsvg%3E';

export function getActivityImage(activity) {
  if (activity?.imageUrl && !activity.imageUrl.includes('placeholder')) {
    return activity.imageUrl;
  }
  if (activity?.category && CATEGORY_IMAGES[activity.category]) {
    return CATEGORY_IMAGES[activity.category];
  }
  return CATEGORY_IMAGES.Sports;
}

export function getSafeAvatar(name = 'User', avatarUrl) {
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  const cleanSeed = encodeURIComponent(name.trim() || 'User');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function handleImageError(e, fallbackCategory = 'Sports') {
  if (e.target.dataset.triedFallback) {
    e.target.src = FALLBACK_ACTIVITY_BANNER;
    return;
  }
  e.target.dataset.triedFallback = 'true';
  e.target.src = CATEGORY_IMAGES[fallbackCategory] || FALLBACK_ACTIVITY_BANNER;
}

export function handleAvatarError(e, name = 'User') {
  e.target.src = getSafeAvatar(name);
}
