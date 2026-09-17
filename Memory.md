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
- **Backend:** Node.js (v22), Express.js, MongoDB (v8.2 running locally on `mongodb://localhost:27017/connect2go`), Mongoose, Socket.IO, JWT, bcryptjs.
- **Frontend:** Vite, React 19, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet.
- **Design Components & Animation Stack:**
  - `shadcn/ui`: Dialogs, inputs, sliders, badges, tooltips.
  - `Watermelon UI`: Segmented controls, action sheets, interactive switches.
  - `React Bits`: Text reveal effects, glowing card borders, animated match counters.
  - `21st.dev`: Bento grid layouts, activity cards.
  - `Swishy AI`: Fluid spring physics, celebration particle transitions on reveal handshake.
  - `Meshy AI`: 3D styled anonymous avatars and activity badges.
- **Skills Installed:**
  - `ui-ux-pro-max-skill` (Cloned & installed at `C:\Users\herek\.gemini\config\skills\ui-ux-pro-max-skill`).

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
| **Phase 0** | Documentation, Git & Design System Setup | **COMPLETED** | PRD, Architecture, Rules, Phases, Design, Memory created. Git repo connected & pushed to GitHub (`KINSHUKHERE/Connect2Go`). Comprehensive `.gitignore` active. `ui-ux-pro-max` installed. |
| **Phase 1** | Project Initialization & Scaffolding | *READY* | Backend & Frontend packages setup |
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
