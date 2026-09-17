# Project Memory & Context Tracker - Connect2Go

**Project Name:** Connect2Go (*"Nearby Connect"*)  
**Last Updated:** Phase 0 Completed (Documentation, UI/UX Pro Max Skill Installed, Project Guardrails Defined)  
**Current Status:** Ready to Begin Phase 1 (Scaffolding & Environment Setup)

---

## 1. Project Overview & Quick Reference
- **Concept:** Location-based socializing and activity-partner platform combining radius discovery, matching engine, and anonymous real-time chat with a mutual identity reveal handshake.
- **Academic Context:** Minor Project (B.Tech VII Sem CSE), Poornima University, Jaipur.
- **Supervisor:** Kireet Sir, Associate Professor.
- **Team:** Kinshuk Khandelwal, Kirti, Lavanshu Bansal, Lavish Garg.
- **Reference Files:**
  - `PRD.md`: Full product requirements and 10 modules.
  - `Architecture.md`: System flow, ERD, REST routes, Socket.IO protocols.
  - `Rules.md`: AI guardrails, forbidden libraries, code style, error handling.
  - `4.Phases.md`: 9-phase step-by-step roadmap.
  - `Design.md`: Color tokens, dark theme, typography, component library guides.

---

## 2. Configured Tech Stack & Design Ecosystem
- **Brand Identity:** Connect2Go (*"People Nearby. Activities Together."*)
- **Design Ethos:** *"Spotify's friendliness + Airbnb's clean UI + modern Gen-Z community app + calm wellness-inspired visual language"*.
- **Official Brand Assets Copied & Verified:**
  - `design-assets/`: Root design folder for immediate visualization (`Png logo.png`, `Normal Logo.png`, `Favicon.png`, `Ui.png`).
  - `frontend/public/`: `logo.png`, `logo-normal.png`, `favicon.png`.
  - `frontend/src/assets/`: `logo.png`, `logo-normal.png`, `favicon.png`, `ui-mockup.png`.
- **Backend Hierarchy Established:** `backend/src/{config, controllers, middleware, models, routes, services, sockets, utils}`.
- **Frontend Hierarchy Established:** `frontend/src/{components/{layout, map, requests, chat, profile, safety, ui}, context, pages, services, assets}` and `frontend/public/`.
- **Core Color Tokens:** Primary Green `#22C55E`, Secondary `#16A34A`, Mint `#A7F3D0`, Light Mint `#ECFDF5`, Canvas `#F8FAFC`, White `#FFFFFF`, Border `#E2E8F0`, Dark Text `#0F172A`.
- **Typography:** `Plus Jakarta Sans` (Fallback: `Inter`).
- **Installed Skills:** `ui-ux-pro-max-skill` (Cloned & installed at `C:\Users\herek\.gemini\config\skills\ui-ux-pro-max-skill`).

---

## 3. Seed Campus Coordinates & Test Personas
- **Primary Campus Location:** Poornima University, Sitapura Extension, Jaipur, Rajasthan  
  - Coordinates: Latitude `26.7725`, Longitude `75.8753` (GeoJSON: `[75.8753, 26.7725]`).
- **Pre-Seeded Demo Accounts:**
  1. `kinshuk@poornima.edu.in` (Kinshuk Khandelwal) — Sports / Badminton enthusiast.
  2. `kirti@poornima.edu.in` (Kirti) — UI/UX & Web Dev study partner.
  3. `lavanshu@poornima.edu.in` (Lavanshu Bansal) — Backend & Hackathon partner.
  4. `lavish@poornima.edu.in` (Lavish Garg) — Cycling & Fitness enthusiast.

---

## 4. Phase Completion Checklist

| Phase # | Phase Title | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Documentation, Assets, Folders & Design Spec | **COMPLETED** | PRD, Architecture, Rules, Phases, Design (28 sections), Memory created. Brand assets (logos, favicon, UI mockup) copied. Frontend & Backend folder trees created. `ui-ux-pro-max` installed. Synced with GitHub. |
| **Phase 1** | Project Initialization & Scaffolding | *READY* | NOT started yet — awaiting user's explicit signal |
| **Phase 2** | Database Modeling & Seed Data | *PENDING* | User, ActivityRequest, Chat models with `2dsphere` index |
| **Phase 3** | Authentication & User Profile | *PENDING* | JWT auth, bcrypt, profile editor |
| **Phase 4** | Activity Requests & Geospatial API | *PENDING* | CRUD, `$near` radius search |
| **Phase 5** | Multi-Variable Matching Engine | *PENDING* | Proximity + Interests + Schedule score algorithm |
| **Phase 6** | Interactive Map & Bento UI | *PENDING* | Leaflet, radar circle, Bento cards |
| **Phase 7** | Socket.IO Anonymous Chat & Handshake | *PENDING* | Real-time chat, pseudonyms, reveal handshake |
| **Phase 8** | Notifications & Safety Moderation | *PENDING* | User blocking, reporting, live alerts |
| **Phase 9** | Testing, Polish & Viva Prep | *PENDING* | End-to-end verification, demo walkthrough |

---

## 5. Next Immediate Step for the AI
- Proceed with **Phase 1**:
  1. Scaffold `backend/` and `frontend/` folders.
  2. Install dependencies for both layers.
  3. Verify clean dev server startup.
