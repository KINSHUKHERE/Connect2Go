# Connect2Go 🚀

> **People Nearby. Activities Together.**  
> *Find Your People. In The Real World.*

[![Status](https://img.shields.io/badge/status-active_development-emerald.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React_19_•_Vite_•_Tailwind_CSS-blue.svg)]()
[![Maps](https://img.shields.io/badge/maps-Mapbox_Streets_v12_•_Leaflet-000000.svg)]()
[![Backend](https://img.shields.io/badge/backend-Node.js_•_Express_•_Socket.IO-indigo.svg)]()
[![Database](https://img.shields.io/badge/database-Supabase_•_PostgreSQL-3ECF8E.svg)]()
[![Media](https://img.shields.io/badge/media-Cloudinary-3448C5.svg)]()
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

---

## 📌 About Connect2Go

**Connect2Go** connects people nearby through shared sports, fitness sessions, study groups, gaming blitzes, and casual real-world meetups.

Unlike traditional feed-based social media, **Connect2Go is hyper-local, activity-first, and privacy-first**:
1. **Activity Requests:** Users post real-world activities (e.g. *"Looking for 2 badminton players within 3 km"*).
2. **Interactive Mapbox Geospatial Engine:** High-definition retina map exploration powered by **Mapbox Streets v12**, dynamic radar radius search (1–20 km), and 1-click live GPS detection.
3. **All-India Geocoding:** Search any street, colony, campus, ground, town, or village across India (powered by Mapbox Places with smart fallback).
4. **Algorithmic Compatibility Engine:** Multi-factor matching scoring peers based on spatial distance, shared hobbies, weekly schedule overlap, and skill level.
5. **Real-Time Messaging Hub (`/messages`):** WhatsApp Web style 2-column interface with live status, sent/read receipts, dual-reveal handshake protocol, and celebration confetti.
6. **WhatsApp-Style Navbar Message Dropdown:** Instant hover/click popup in the top navigation bar showing active peer chats, recent messages, and unread reply count badges.
7. **Dedicated Pages Architecture:** Distinct, bookmarkable pages for Discover (`/`), Matched Peers (`/matches`), My Activities (`/my-activities`), Messages (`/messages`), Profile (`/profile`), Settings & Privacy (`/settings`), Safety & Trust (`/safety`), and Admin (`/admin`).
8. **Universal Search Engine:** Dedicated, responsive search bars on every page with instant filtering, quick-clear (`X`) buttons, and intuitive empty states.

---

## 🚀 Key Features

### 🔍 1. Universal Search Engine Across All Pages
- **Admin Dashboard (`/admin`):** Real-time search filtering across Recent Activity Requests (name, sport, venue, status), Safety Reports, New Users, and Top Locations, with a dedicated mobile search bar.
- **Messages & Live Chat (`/messages`):** WhatsApp-style full-text search matching peer names, activity titles, and **in-chat message history** (`messages[].text`).
- **Discover Feed (`/`):** Instant search filtering by activity title, description, category, location, **host/creator name**, and interest tags.
- **Matched Peers (`/matches`):** Dedicated search bar to find peers by name, specific sports/hobbies, or match highlights.
- **My Activities (`/my-activities`):** Search bar filtering hosted or joined activities by title, sport category, location, or description.
- **Map & Location Pickers:** Debounced search for cities, grounds, campuses, and areas across India with 1-click clear buttons.

### 💬 2. Real-Time Chat & WhatsApp-Style Navbar Dropdown
- **Full-Screen Chat Hub (`/messages`):** WhatsApp Web inspired layout featuring active conversations, live online/offline indicators, timestamped message stream, and dual-reveal handshake protocol.
- **Navbar Message Dropdown:** Hover or click the message icon in the top navigation bar to view a WhatsApp-style popup showing contact names, avatars, online status, last message snippets with checkmarks, timestamps, and active reply counters.
- **Reply Counter Badge:** Displays the exact count of active chats where peers have replied, synchronizing dynamically across the navigation bar, landing page launcher, and chat hub.

### 🧠 3. Multi-Factor Compatibility Engine (`/matches`)
- Scores partners nearby using a 4-pillar compatibility algorithm:
  - **Spatial Proximity (40%):** Weighted distance score (closer peers score higher).
  - **Shared Hobbies (30%):** Direct intersection of sports, fitness, and lifestyle interests.
  - **Schedule Overlap (20%):** Matching weekday morning/evening and weekend availability.
  - **Skill Level Match (10%):** Beginner, Intermediate, or Advanced alignment.
- Sort peers instantly by **Best Match** or **Nearest**.

### 🛡️ 4. Trust, Safety & Spatial Privacy (`/safety` & `/settings`)
- **Location Fuzzing:** Optional ~400m random spatial jitter protecting home addresses while preserving neighborhood relevance.
- **Dual-Reveal Handshake:** Keeps user identity anonymous until both participants mutually agree to reveal contact details.
- **Trust & Safety Center:** 4 Golden Rules for offline meetups, zero-tolerance harassment policies, and Indian emergency numbers (112, 100, 1091, 108).
- **Terms & Legal Transparency:** Comprehensive Privacy Policy and Terms of Service with zero background location tracking guarantees.

### 👤 5. User Profile & Preferences (`/profile` & `/settings`)
- **My Profile (`/profile`):** Trust score pill, total activities hosted/joined, editable bio, sports & hobby tags, and recent activity timeline.
- **Settings Center (`/settings`):** Spatial fuzzing toggle, default search radius slider (1–20 km), primary skill level, weekly availability matrix, and notification preferences.

### 📊 6. Admin Control Center (`/admin`)
- **KPI Metrics:** Total users, active users, activity requests, successful matches, and pending safety reports.
- **Live Search & Moderation:** Real-time filtering across requests and reports with direct action triggers.
- **Collapsible Sidebar:** Smooth desktop sidebar collapse/expand toggle and full mobile drawer support.

---

## 🗺️ Page Routes & Sitemap

| Route | Page | Purpose |
|---|---|---|
| `/` | **Discover Feed** | Explore nearby activities via interactive Mapbox map or card grid |
| `/matches` | **Matched Peers** | Algorithmic compatibility scoring & partner discovery |
| `/my-activities` | **My Activities** | Manage hosted and joined activity requests |
| `/messages` | **Messages & Chat** | Full-screen WhatsApp Web style messaging hub |
| `/profile` | **My Profile** | User stats, trust rating, editable bio, and hobby tags |
| `/settings` | **Settings & Privacy** | Location fuzzing, search radius, availability matrix |
| `/safety` | **Safety & Trust** | Offline meetup rules, emergency helplines & legal terms |
| `/admin` | **Admin Dashboard** | Platform metrics, user directories & safety queue |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 with Vite (lightning-fast HMR)
- **Styling:** Tailwind CSS with modern design tokens and clean slate palette
- **Maps & Geolocation:** Leaflet, React-Leaflet, Mapbox Streets v12 Retina Tiles, Mapbox Geocoding API
- **Icons & Visuals:** Lucide React, Canvas Confetti
- **State Management:** React Context API (`AuthContext`, `GeoContext`, `ChatContext`, `ToastContext`)
- **Dynamic Titles:** Instant route-based `document.title` synchronization

### Backend
- **Runtime:** Node.js & Express.js
- **Real-Time Protocol:** Socket.IO for anonymous coordination chats
- **Database & Auth:** Supabase (PostgreSQL with PostGIS extensions & Row Level Security)
- **Media Storage:** Cloudinary (secure avatar & media storage with Multer memory buffering)

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### 2. Clone the Repository
```bash
git clone https://github.com/KINSHUKHERE/Connect2Go.git
cd Connect2Go
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your Supabase & Cloudinary credentials in .env
npm start
```
*Backend runs on `http://localhost:5000`.*

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Set your VITE_MAPBOX_TOKEN in .env
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_MAPBOX_TOKEN=your-mapbox-public-token
```

### Backend (`backend/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## 👨‍💻 Creator & Credits

Developed by **Kinshuk Khandelwal**

- 💼 **LinkedIn:** [linkedin.com/in/kinshuk-khandelwal-43024b290](https://www.linkedin.com/in/kinshuk-khandelwal-43024b290/)
- 🐙 **GitHub:** [@KINSHUKHERE](https://github.com/KINSHUKHERE)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.


