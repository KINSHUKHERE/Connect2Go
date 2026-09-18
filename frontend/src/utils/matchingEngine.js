/**
 * Multi-Factor Compatibility Matching Engine for Connect2Go
 * Computes algorithmic compatibility score between users and nearby activity requests/peers:
 * MatchScore = (0.40 * Distance) + (0.30 * Interests) + (0.20 * Availability) + (0.10 * Skill)
 */

/**
 * Calculates algorithmic compatibility score between current user and target (activity or peer)
 * @param {Object} currentUser Active user profile from AuthContext
 * @param {Object} target Activity object or Peer user object
 * @param {'activity' | 'peer'} type Type of target
 * @returns {Object} Calculated score, highlights, shared tags, and breakdown
 */
export function calculateCompatibility(currentUser, target, type = 'activity') {
  if (!target) {
    return { score: 65, label: '65% Match', badgeVariant: 'outline', sharedTags: [], highlight: 'Nearby activity' };
  }

  const userInterests = (currentUser?.interests || ['Sports', 'Badminton', 'Fitness', 'Coding']).map((i) => i.toLowerCase());
  const userAvailability = (currentUser?.availability || 'Evening').toLowerCase();
  const userSkill = (currentUser?.skill_level || 'Intermediate').toLowerCase();

  // 1. Distance Points (Max 40 points)
  const dist = parseFloat(target.distanceKm ?? target.distance_km ?? target.distance ?? 2.0);
  let distanceScore = 40;

  if (dist <= 1.0) {
    distanceScore = 40;
  } else if (dist <= 3.0) {
    distanceScore = 32 + (3.0 - dist) * 4;
  } else if (dist <= 6.0) {
    distanceScore = 24 + (6.0 - dist) * 2.6;
  } else if (dist <= 12.0) {
    distanceScore = 14 + (12.0 - dist) * 1.6;
  } else {
    distanceScore = Math.max(6, 14 - (dist - 12.0) * 0.5);
  }

  // 2. Interests Overlap Points (Max 30 points)
  let interestScore = 10;
  const sharedTags = [];

  if (type === 'peer') {
    const peerInterests = (target.interests || []).map((i) => i.toLowerCase());
    const common = userInterests.filter((uInt) =>
      peerInterests.some((pInt) => pInt.includes(uInt) || uInt.includes(pInt))
    );

    target.interests?.forEach((origTag) => {
      if (userInterests.some((uInt) => origTag.toLowerCase().includes(uInt) || uInt.includes(origTag.toLowerCase()))) {
        sharedTags.push(origTag);
      }
    });

    if (common.length >= 3) interestScore = 30;
    else if (common.length === 2) interestScore = 25;
    else if (common.length === 1) interestScore = 18;
    else interestScore = 8;
  } else {
    // Activity match
    const category = (target.category || '').toLowerCase();
    const title = (target.title || '').toLowerCase();
    const desc = (target.description || '').toLowerCase();

    const matchesCategory = userInterests.some((i) => category.includes(i) || i.includes(category));
    const matchesKeyword = userInterests.some((i) => title.includes(i) || desc.includes(i));

    if (matchesCategory && matchesKeyword) {
      interestScore = 30;
      sharedTags.push(target.category);
    } else if (matchesCategory || matchesKeyword) {
      interestScore = 24;
      sharedTags.push(target.category || 'Shared Interest');
    } else {
      interestScore = 10;
    }
  }

  // 3. Availability Points (Max 20 points)
  let availScore = 14;
  const timeText = ((target.time_slot || target.time || target.availability || '') + '').toLowerCase();

  const isEveningMatch = (userAvailability.includes('evening') || userAvailability.includes('all')) &&
    (timeText.includes('pm') || timeText.includes('evening') || timeText.includes('18:') || timeText.includes('19:') || timeText.includes('20:'));
  const isMorningMatch = (userAvailability.includes('morning') || userAvailability.includes('all')) &&
    (timeText.includes('am') || timeText.includes('morning') || timeText.includes('06:') || timeText.includes('07:'));
  const isWeekendMatch = (userAvailability.includes('weekend') || userAvailability.includes('all')) &&
    (timeText.includes('saturday') || timeText.includes('sunday') || timeText.includes('weekend'));

  if (isEveningMatch || isMorningMatch || isWeekendMatch) {
    availScore = 20;
  } else if (timeText.includes('flexible') || timeText.includes('open') || userAvailability.includes('flexible')) {
    availScore = 16;
  } else {
    availScore = 10;
  }

  // 4. Skill Level Match (Max 10 points)
  let skillScore = 8;
  const targetSkill = ((target.skill_level || target.skill || 'Intermediate') + '').toLowerCase();
  if (targetSkill === userSkill || targetSkill.includes('all') || targetSkill.includes('beginner')) {
    skillScore = 10;
  } else {
    skillScore = 7;
  }

  // Composite Score
  const rawScore = distanceScore + interestScore + availScore + skillScore;
  const finalScore = Math.min(99, Math.max(52, Math.round(rawScore)));

  // Generate Highlight Phrase
  let highlight = '';
  if (sharedTags.length > 0 && dist <= 2.5) {
    highlight = `Both into ${sharedTags[0]} • Within ${dist.toFixed(1)} km`;
  } else if (sharedTags.length > 0) {
    highlight = `Shared hobby: ${sharedTags.slice(0, 2).join(' & ')}`;
  } else if (dist <= 1.5) {
    highlight = `Very close neighbor (${dist.toFixed(1)} km away)`;
  } else {
    highlight = `Active in your area (${dist.toFixed(1)} km)`;
  }

  // Badge Styling Variant
  let badgeVariant = 'outline';
  if (finalScore >= 85) badgeVariant = 'mint';
  else if (finalScore >= 70) badgeVariant = 'brand';

  return {
    score: finalScore,
    label: `${finalScore}% Match`,
    badgeVariant,
    sharedTags,
    highlight,
    breakdown: {
      distance: Math.round(distanceScore),
      interests: Math.round(interestScore),
      availability: Math.round(availScore),
      skill: Math.round(skillScore),
    },
  };
}

/**
 * Sort array of activities or peers by algorithmic compatibility score
 * @param {Array} items List of activities or peers
 * @param {Object} currentUser Active user profile
 * @param {'activity' | 'peer'} type Type of items
 * @returns {Array} Sorted items with attached .compatibility metadata
 */
export function sortByCompatibility(items, currentUser, type = 'activity') {
  if (!Array.isArray(items)) return [];
  return [...items]
    .map((item) => ({
      ...item,
      compatibility: calculateCompatibility(currentUser, item, type),
    }))
    .sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));
}
