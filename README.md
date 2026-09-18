# Connect2Go 🚀

> **People Nearby. Activities Together.**  
> *Find Your People. In The Real World.*

[![Status](https://img.shields.io/badge/status-active_development-emerald.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React_19_•_Vite_•_Tailwind_CSS-blue.svg)]()
[![Maps](https://img.shields.io/badge/maps-Mapbox_Streets_v12_•_Leaflet-000000.svg)]()
[![Backend](https://img.shields.io/badge/backend-Node.js_•_Express_•_Socket.IO-indigo.svg)]()
[![Database](https://img.shields.io/badge/database-Supabase_•_PostgreSQL-3ECF8E.svg)]()
[![Media](https://img.shields.io/badge/media-Cloudinary-3448C5.svg)]()

---

## 📌 About Connect2Go

**Connect2Go** connects people nearby through shared sports, fitness sessions, study groups, gaming blitzes, and casual real-world meetups.

Unlike traditional feed-based social media, **Connect2Go is hyper-local, activity-first, and privacy-first**:
1. **Activity Requests:** Users host activities (e.g. *"Looking for 2 badminton players within 3 km"*).
2. **Interactive Mapbox Geospatial Engine:** High-definition retina map exploration powered by **Mapbox Streets v12**, dynamic radar radius search (1–20 km), and 1-click live GPS detection.
3. **All-India Geocoding:** Search any street, colony, campus, ground, town, or village across India (powered by Mapbox Places with fallback).
4. **Anonymous Real-Time Chat:** Coordinate meetup logistics safely using Socket.IO without revealing personal phone numbers or private social handles.
5. **Trust, Safety & Legal Hub:** Full-page center outlining real-world meetup safety rules, community conduct standards, emergency helplines, Terms & Conditions, and spatial privacy guarantees.
6. **Admin Control Portal:** Separate management dashboard (`/admin`) with collapsible navigation, platform health metrics, and moderation queues.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 with Vite (blazing-fast HMR)
- **Styling:** Tailwind CSS with custom design tokens, responsive full-width canvas
- **Maps & Geolocation:** Leaflet, React-Leaflet, Mapbox Streets v12 Retina Tiles, Mapbox Geocoding API
- **Icons & UI:** Lucide React, Canvas Confetti
- **State & Context:** React Context API (AuthContext, GeoContext, ToastContext)

### Backend
- **Runtime:** Node.js & Express.js
- **Real-Time Communication:** Socket.IO for anonymous coordination chats
- **Database & Auth:** Supabase (PostgreSQL with PostGIS extensions & Row Level Security)
- **Media Uploads:** Cloudinary (secure avatar & media storage via Multer memory buffering)

---

## 🚀 Key Features

- 📍 **Mapbox HD Maps & Live GPS**: High-resolution 2x retina tiles with street-level clarity and live pin dropping.
- 🎯 **Advanced Activity Filters**: Filter by date (Today, Tomorrow, Weekend), open spots, and proximity radius.
- 🏸 **Category Banners & Avatars**: Curated sport & hobby themes with 100% reliable fallback handlers.
- 💬 **Anonymous Peer Chat**: Real-time messaging with online status indicators and unread badges.
- 🛡️ **Dedicated Trust & Safety Page**: 4 Golden Rules for offline meetups, zero-tolerance policy, and Indian emergency helplines (112, 100, 1091, 108).
- 📜 **Full Legal Transparency**: Dedicated Terms & Conditions and Privacy Policy explaining zero-background-tracking guarantees.
- ⚙️ **Collapsible Admin Dashboard**: View platform metrics, active requests, reports, and user growth.

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
# Fill in your Supabase & Cloudinary credentials in .env
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

Developed with ❤️ by **Kinshuk Khandelwal**

- 💼 **LinkedIn:** [linkedin.com/in/kinshuk-khandelwal-43024b290](https://www.linkedin.com/in/kinshuk-khandelwal-43024b290/)
- 🐙 **GitHub:** [@KINSHUKHERE](https://github.com/KINSHUKHERE)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

