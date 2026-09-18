import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const sampleActivities = [
  {
    title: 'Evening Badminton Doubles Rally',
    category: 'Sports',
    description: 'Looking for 2 more players for an informal friendly badminton rally at the campus indoor courts.',
    location_label: 'Campus Sports Arena',
    lat: 26.7725,
    lon: 75.8753,
    max_participants: 4,
    current_participants: 2,
    time_slot: 'Today, 6:00 PM - 7:30 PM',
    creator_name: 'Kinshuk K.',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'open'
  },
  {
    title: 'Morning 5K Jog & Cardio Session',
    category: 'Fitness',
    description: 'Pacing at ~5:30/km around the outer ring track. Beginners and regulars both welcome!',
    location_label: 'Track & Athletic Grounds',
    lat: 26.7740,
    lon: 75.8765,
    max_participants: 5,
    current_participants: 3,
    time_slot: 'Tomorrow, 6:30 AM',
    creator_name: 'Lavanshu B.',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'open'
  },
  {
    title: 'Weekend Chess Blitz & Coffee',
    category: 'Gaming',
    description: 'Casual 5+3 blitz games and tactics over iced cold brews at the cafeteria.',
    location_label: 'Student Center Lounge',
    lat: 26.7710,
    lon: 75.8730,
    max_participants: 2,
    current_participants: 1,
    time_slot: 'Saturday, 4:00 PM',
    creator_name: 'Lavish G.',
    creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'open'
  },
  {
    title: 'Fullstack Dev & Hackathon Prep',
    category: 'Study',
    description: 'Working on React & Supabase architectures, exploring spatial queries and building cool side projects together.',
    location_label: 'Central Innovation Lab',
    lat: 26.7735,
    lon: 75.8780,
    max_participants: 4,
    current_participants: 2,
    time_slot: 'Friday, 5:00 PM - 8:00 PM',
    creator_name: 'Kirti S.',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'open'
  }
];

async function seed() {
  console.log('--- Seeding Initial Activities into Supabase ---');
  try {
    for (const act of sampleActivities) {
      const { lat, lon, ...data } = act;
      // PostGIS Point geometry text
      const pointWkt = `SRID=4326;POINT(${lon} ${lat})`;

      const { data: inserted, error } = await supabase
        .from('activities')
        .insert({
          ...data,
          location: pointWkt
        })
        .select();

      if (error) {
        console.error(`⚠️ Could not seed "${act.title}":`, error.message);
      } else {
        console.log(`✅ Seeded "${act.title}"`);
      }
    }
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  }
}

seed();
