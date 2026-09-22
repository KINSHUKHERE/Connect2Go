/**
 * Image Utilities & Fallbacks for Connect2Go
 * Ensures 100% of images load gracefully with zero broken thumbnails.
 */

export const PREDEFINED_ACTIVITY_IMAGES = {
  // Pre-defined Activity Names
  'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  'Morning Jogging': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
  'Study Sprint': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  'Casual Chess': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80',
  'Weekend Cycling': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
  'Coffee Meetup': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  'Photography Walk': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  'Acoustic Jam': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  'Others': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',

  // Categories
  Sports: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  Fitness: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
  Gaming: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80',
  Study: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  Food: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  Travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
  Music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
};

export const CATEGORY_IMAGES = PREDEFINED_ACTIVITY_IMAGES;
export const categoryBanners = PREDEFINED_ACTIVITY_IMAGES;

export function getActivityImage(activity) {
  if (!activity) return PREDEFINED_ACTIVITY_IMAGES.Sports;

  const title = String(activity.title || activity.name || '').trim().toLowerCase();
  const category = String(activity.category || '').trim();

  if (title.includes('badminton')) return PREDEFINED_ACTIVITY_IMAGES['Badminton'];
  if (title.includes('jogging') || title.includes('running') || title.includes('run')) return PREDEFINED_ACTIVITY_IMAGES['Morning Jogging'];
  if (title.includes('study') || title.includes('read') || title.includes('exam')) return PREDEFINED_ACTIVITY_IMAGES['Study Sprint'];
  if (title.includes('chess') || title.includes('board')) return PREDEFINED_ACTIVITY_IMAGES['Casual Chess'];
  if (title.includes('cycling') || title.includes('cycle') || title.includes('bike')) return PREDEFINED_ACTIVITY_IMAGES['Weekend Cycling'];
  if (title.includes('coffee') || title.includes('tea') || title.includes('cafe')) return PREDEFINED_ACTIVITY_IMAGES['Coffee Meetup'];
  if (title.includes('photo') || title.includes('camera') || title.includes('walk')) return PREDEFINED_ACTIVITY_IMAGES['Photography Walk'];
  if (title.includes('jam') || title.includes('guitar') || title.includes('music')) return PREDEFINED_ACTIVITY_IMAGES['Acoustic Jam'];

  if (activity.imageUrl && !activity.imageUrl.includes('placeholder') && !activity.imageUrl.startsWith('data:image/svg')) {
    return activity.imageUrl;
  }
  if (activity.image_url && !activity.image_url.includes('placeholder') && !activity.image_url.startsWith('data:image/svg')) {
    return activity.image_url;
  }

  if (category && PREDEFINED_ACTIVITY_IMAGES[category]) {
    return PREDEFINED_ACTIVITY_IMAGES[category];
  }

  return PREDEFINED_ACTIVITY_IMAGES['Sports'];
}

export const DEFAULT_MALE_AVATAR = '/avatars/male.png';
export const DEFAULT_FEMALE_AVATAR = '/avatars/female.png';
export const DEFAULT_UNKNOWN_AVATAR = '/avatars/male.png';

export function getSafeAvatar(name = 'User', avatarUrl, gender = '') {
  const normGender = String(gender || '').trim().toLowerCase();
  const defaultForGender = (normGender === 'female' || normGender === 'f') ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;

  if (
    avatarUrl && 
    !avatarUrl.includes('seed=UnknownPerson') && 
    !avatarUrl.includes('api.dicebear.com') &&
    (avatarUrl.startsWith('http') || avatarUrl.startsWith('/') || avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:'))
  ) {
    return avatarUrl;
  }

  return defaultForGender;
}

export function handleImageError(e, fallbackCategory = 'Sports') {
  e.target.onerror = null;
  const cat = fallbackCategory || 'Sports';
  e.target.src = PREDEFINED_ACTIVITY_IMAGES[cat] || PREDEFINED_ACTIVITY_IMAGES['Sports'];
}

export function handleAvatarError(e, name = 'User', gender = '') {
  e.target.src = getSafeAvatar(name, null, gender);
}
