# Project Memory & Context Tracker - Connect2Go

**Project Name:** Connect2Go (*"Nearby Connect"*)  
**Last Updated:** Phase 0 Completed (Documentation, UI/UX Pro Max Skill Installed, Project Guardrails Defined)  
**Current Status:** Ready to Begin Phase 1 (Scaffolding & Environment Setup)

---

## 1. Project Overview & Quick Reference
- **Concept:** Location-based socializing and activity-partner platform combining radius discovery, matching engine, and anonymous real-time chat with a mutual identity reveal handshake.
- **Reference Files:**
  - `PRD.md`: Full product requirements and 10 modules.
  - `Architecture.md`: System flow, ERD, REST routes, Socket.IO protocols.
  - `Rules.md`: AI guardrails, forbidden libraries, code style, error handling.
  - `4.Phases.md`: 9-phase step-by-step roadmap.
  - `Design.md`: Color tokens, dark theme, typography, component library guides.

---

## 2. Configured Tech Stack & Cloud Services
- **Brand Identity:** Connect2Go (*"People Nearby. Activities Together."*)
- **Design Ethos:** *"Spotify's friendliness + Airbnb's clean UI + modern Gen-Z community app + calm wellness-inspired visual language"*.
- **Database:** Supabase (Managed PostgreSQL + PostGIS spatial extensions).
- **Authentication:** Supabase Auth with Email/Password & **Google OAuth 2.0**.
- **Media Storage:** Cloudinary (CDN-optimized image transformations, responsive WebP delivery).
- **Real-Time Layer:** Supabase Realtime & Socket.IO.
- **Frontend Stack:** React 19 (Vite), Tailwind CSS, Leaflet / React-Leaflet, Lucide Icons, Plus Jakarta Sans.
- **Official Brand Assets Copied & Verified:**
  - `design-assets/`: Root design folder (`Png logo.png`, `Normal Logo.png`, `Favicon.png`, `Ui.png`).
  - `frontend/public/`: `logo.png`, `logo-normal.png`, `favicon.png`.
  - `frontend/src/assets/`: `logo.png`, `logo-normal.png`, `favicon.png`, `ui-mockup.png`.
- **Backend Hierarchy Established:** `backend/src/{config, controllers, middleware, models, routes, services, sockets, utils}`.
- **Frontend Hierarchy Established:** `frontend/src/{components/{layout, map, requests, chat, profile, safety, ui}, context, pages, services, assets}` and `frontend/public/`.
- **Installed Skills:** `ui-ux-pro-max-skill`.

---

## 3. Default Demo Coordinates & Personas
- **Default City Coordinates:** Latitude `26.7725`, Longitude `75.8753` (GeoJSON: `[75.8753, 26.7725]`).
- **Pre-Seeded Demo Accounts:**
  1. `alex@connect2go.com` (Alex K.) — Sports / Badminton enthusiast.
  2. `sarah@connect2go.com` (Sarah M.) — UI/UX & Web Dev study partner.
  3. `liam@connect2go.com` (Liam B.) — Backend & Hackathon partner.
  4. `maya@connect2go.com` (Maya G.) — Cycling & Fitness enthusiast.

---

## 4. Progressive Level Completion Checklist

| Level # | Level Title | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Level 0** | Foundation, Cloud Credentials & Scaffolding | *READY* | Awaiting credentials (Supabase, Cloudinary, Google OAuth) |
| **Level 1** | Supabase Auth, Google OAuth & Profiles | *PENDING* | Auth, Cloudinary avatar upload, profile editor |
| **Level 2** | PostGIS Database & Activity Requests | *PENDING* | PostGIS tables, spatial radius query, request CRUD |
| **Level 3** | Discovery Center & Interactive Map | *PENDING* | Leaflet, radar circle, Bento cards, category pills |
| **Level 4** | Multi-Factor Algorithmic Matching | *PENDING* | Proximity + Interests + Schedule score algorithm |
| **Level 5** | Anonymous Real-Time Chat & Handshake | *PENDING* | Realtime chat, pseudonyms, reveal handshake |
| **Level 6** | Safety Controls, Notifications & Settings | *PENDING* | User blocking, reporting, live alerts |
| **Level 7** | Polish, Responsive QA & Launch Readiness | *PENDING* | Mobile audit, skeleton loaders, launch test |

---

## 5. Next Immediate Step for the AI
- Proceed with **Phase 1**:
  1. Scaffold `backend/` and `frontend/` folders.
  2. Install dependencies for both layers.
  3. Verify clean dev server startup.
