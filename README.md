# Connect2Go (Nearby Connect) 🚀

> **A Location-Based Socializing & Activity Partner Platform**

[![Status](https://img.shields.io/badge/status-active_development-blue.svg)]()
[![Stack](https://img.shields.io/badge/stack-React_19_•_Node.js_•_Express_•_MongoDB_•_Socket.IO-indigo.svg)]()
[![UI/UX](https://img.shields.io/badge/ui%2Fux-shadcn%2Fui_•_Watermelon_•_ReactBits_•_21st.dev-emerald.svg)]()

---

## 📌 Project Overview

**Connect2Go** connects people nearby through shared sports, fitness, academic study groups, hobbies, and casual activities.

Unlike traditional social media focused on follower feeds, **Connect2Go is hyper-local, activity-first, and privacy-first**:
1. **Activity Requests:** Users post requests (e.g. *"Looking for a badminton partner within 2 km"*).
2. **Geospatial Discovery:** Radius-based discovery using HTML5 Geolocation, Leaflet interactive maps, and MongoDB `2dsphere` spatial indexing.
3. **Multi-Factor Matching:** Matches partners based on distance, shared interests, availability schedules, and skill level.
4. **Anonymous Real-Time Chat & Reveal Handshake:** Real-time chat using Socket.IO with masked pseudonyms and 3D avatars (Meshy AI aesthetic). Real identities are only unveiled upon mutual consent through a dual "Reveal Identity" handshake.

---

## 📚 Documentation Index

- [**`PRD.md`**](./PRD.md) — Comprehensive Product Requirements Document & 10 Core Modules.
- [**`Architecture.md`**](./Architecture.md) — System Architecture, DFD (Level-0 & Level-1), ERD Schemas, REST APIs & WebSockets Protocol.
- [**`Rules.md`**](./Rules.md) — Engineering rules, allowed/forbidden libraries, security & accessibility guardrails.
- [**`4.Phases.md`**](./4.Phases.md) — Detailed 9-phase execution roadmap.
- [**`Design.md`**](./Design.md) — Visual design tokens, dark OLED theme, typography, and component library specifications.
- [**`Memory.md`**](./Memory.md) — AI context & live project state tracking.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, Leaflet / React-Leaflet, Socket.io-client, Axios, Lucide Icons.
- **UI Components & Animations:** `shadcn/ui`, `Watermelon UI`, `React Bits`, `21st.dev`, `Swishy AI` animations, `Meshy AI` 3D avatars.
- **Backend:** Node.js, Express.js, Socket.IO, Mongoose.
- **Database:** MongoDB with `2dsphere` geospatial indexing.
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` encryption.

---

## 🔒 Safety & Privacy First
- Anonymous default chat with pseudonyms and 3D avatars.
- Mutual "Reveal Identity" handshake protocol.
- User blocking & reporting system.
- Location fuzzing option for residential privacy.
