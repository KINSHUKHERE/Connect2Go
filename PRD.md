# Project Requirements Document (PRD) - Connect2Go

**Project Name:** Connect2Go (*"Nearby Connect — A Location-Based Socializing & Activity Partner Platform"*)  
**Version:** 1.0.0  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Vision

**Connect2Go** (introduced as *Nearby Connect*) is an innovative, location-based socializing and activity-partner platform developed to solve a critical limitation of modern social media: the high friction in finding real-world partners for physical sports, academic study sessions, fitness, hobbies, and casual meetups nearby.

While legacy social networks (Instagram, Facebook, LinkedIn) prioritize passive content consumption, follower graphs, and asynchronous broadcasting, **Connect2Go is hyper-local, activity-first, and privacy-first**:
1. **Activity-First Discovery:** Interactions begin with a concrete activity request (e.g., *"Looking for a badminton partner within 2 km at Sitapura court tonight"*), removing the awkwardness of cold outreach.
2. **Privacy-First Communication:** Users initially communicate via **Anonymous Real-Time Chat** using pseudonyms and stylized 3D-styled avatars (modeled with Meshy AI aesthetics). Users are shielded from personal exposure until both parties mutually agree to trigger the **"Reveal Identity"** handshake.

---

## 2. Problem Statement & Research Gap

### 2.1 The Problem
- **Urban Isolation & Sedentary Lifestyles:** Academic workloads and urban sprawl isolate students and young adults from spontaneous physical activities.
- **Flawed Matching in Existing Platforms:** Meetup platforms cater to large, pre-scheduled group events with weeks of planning; dating applications focus on romance with high friction and superficial criteria. No focused platform exists for ad-hoc, same-day buddy discovery for badminton, gym workouts, or exam prep.
- **Safety and Privacy Hesitations:** Students and privacy-conscious users hesitate to share personal phone numbers or Instagram profiles on open groups (WhatsApp, Telegram) just to find an activity partner.

### 2.2 The Research Gap
Modern literature indicates that common interests and physical proximity catalyze meaningful social relationships. However, there is a distinct gap in existing platforms: none combine:
1. Geospatial radius-based search (MongoDB `2dsphere` + Geolocation API),
2. Micro-activity requests with participant quotas,
3. Multi-criteria matching (interests, activity type, availability, and distance), and
4. Anonymous real-time communication with dual-consent profile revelation.

---

## 3. Target Users & User Personas

### Persona 1: The Campus Athlete (Rohan, 21 — Local Engineering Student)
- **Goal:** Play badminton or cricket after classes (5:30 PM - 7:00 PM).
- **Friction:** Roommates are busy or uninterested; doesn't know who else in the nearby hostels or Sitapura area plays at an intermediate level.
- **Connect2Go Journey:** Creates a request: *"Intermediate Badminton Partner needed @ Sitapura Arena tonight"* with a 3 km radius. Receives match notifications, chats anonymously, confirms the court timing, and reveals identity.

### Persona 2: The Focused Peer Learner (Ananya, 20 — CS Student)
- **Goal:** Prepare for B.Tech End-Semester examinations or collaborate on a web hackathon.
- **Friction:** Hesitant to post on public groups due to unwanted messages and privacy concerns.
- **Connect2Go Journey:** Posts an anonymous request for a *"MERN Stack Hackathon Partner"*. Chats securely under the alias *"QuantumCoder"*, verifies compatibility, and reveals identity only after establishing trust.

### Persona 3: The Fitness & Hobbyist Neighbor (Vikram, 25 — Resident near Sitapura / Jagatpura)
- **Goal:** Early morning 10 km cycling or 5 km jogging partner for motivation.
- **Friction:** Needs an active companion within a tight 2 km radius without commercial gym membership constraints.
- **Connect2Go Journey:** Browses the interactive Leaflet map, filters by "Cycling" and 2 km, finds an open morning ride request, and connects.

---

## 4. Comprehensive Specifications: 10 Core Modules

### Module 1: User Registration & Authentication
- **Registration:** Full Name, Email, Password, College/Affiliation, default location, and avatar.
- **Password Security:** Salted and hashed using `bcryptjs` (minimum 10 salt rounds).
- **JWT Authorization:** Issues signed JSON Web Tokens (7-day validity) with HTTP headers for stateless session validation.
- **Session Validation:** Auto-login verification via `GET /api/auth/me`.

### Module 2: User Profile & Interests Matrix
- **Profile Fields:** Name, Bio, College/Institution, Age, Gender/Pronouns, Location (GeoJSON Point).
- **Interest Taxonomy:**
  - *Sports:* Badminton, Cricket, Football, Table Tennis, Running, Cycling, Gym/Fitness, Yoga, Basketball, Volleyball, Chess.
  - *Tech & Academics:* Coding, Web Dev, AI/ML, Study Groups, Exam Prep, Robotics, Competitive Programming.
  - *Hobbies & Social:* Gaming (Valorant, BGMI, FIFA), Music, Photography, Reading, Travel, Coffee Hangouts.
- **Availability Schedule Matrix:** Configurable time slots:
  - Weekday Mornings (6 AM - 9 AM)
  - Weekday Evenings (5 PM - 9 PM)
  - Weekends (Saturday / Sunday Any time)
  - *"Available Right Now"* live status indicator.
- **Privacy Controls:** Location fuzzing option (masks exact coordinates by ~500m) and profile visibility toggles.

### Module 3: Activity Request Management
- **Creation Form:**
  - Title (e.g., *"Looking for a badminton partner within 2 km"*).
  - Category (Sports, Fitness, Study, Gaming, Outdoor, Social).
  - Description & Skill Level (*Beginner*, *Intermediate*, *Advanced*, *Open to All*).
  - Search Radius (0.5 km to 25 km slider).
  - Location Point (GeoJSON `[longitude, latitude]`) with human-readable Landmark/Address.
  - Activity Date & Time Window.
  - Required Participants count (1 to 10).
- **Lifecycle States:** `OPEN` -> `IN_DISCUSSION` -> `FILLED` -> `COMPLETED` / `CANCELLED`.
- **User Actions:** Edit active request, mark as completed, cancel, delete.

### Module 4: Location-Based Discovery & Interactive Map
- **HTML5 Geolocation API:** Acquires browser coordinates with seamless fallback to manual pin placement on map.
- **MongoDB 2dsphere Indexing:** Utilizes `$near` and `$geoWithin` with `$centerSphere` for sub-100ms geospatial retrieval.
- **Interactive Map Engine (Leaflet):**
  - Live Radar / Radius Circle visualizer centered on the user, updating dynamically as the radius slider shifts.
  - Custom Map Markers distinguishing between open activity requests and nearby active users.
  - Rich interactive marker popups with distance badges (e.g., *"0.8 km away"*), activity details, and instant *"Chat"* CTA.

### Module 5: Search, Sorting & Multi-Faceted Filters
- **Filters:** By Category, Radius slider (0.5 km to 50 km), Schedule Date (Today, Tomorrow, Weekend), and Skill Level.
- **Instant Search:** Debounced full-text search across titles, descriptions, and tags.
- **Dual View Mode:** Single-click toggle between **Interactive Map View** and **Bento Grid Card View**.

### Module 6: Algorithmic Matching Engine
Calculates a normalized **Compatibility Score (0–100%)** between User $U$ and Activity Request $R$:
$$\text{MatchScore} = (W_{\text{dist}} \times S_{\text{dist}}) + (W_{\text{int}} \times S_{\text{int}}) + (W_{\text{avail}} \times S_{\text{avail}}) + (W_{\text{skill}} \times S_{\text{skill}})$$
- **Distance Score ($S_{\text{dist}}$ — 40% weight):** Linear decay from 100% at 0 km down to 0% at the boundary of the requested radius.
- **Interest Score ($S_{\text{int}}$ — 30% weight):** Jaccard overlap between the user's registered hobbies and the request's activity category/tags.
- **Availability Score ($S_{\text{avail}}$ — 20% weight):** Compatibility between the request scheduled window and the user's availability matrix.
- **Skill Score ($S_{\text{skill}}$ — 10% weight):** Exact skill match (100%) or adjacent level (60%).
- **UI Highlighting:** Badges for high matches (e.g., *"94% Match: Shared Badminton interest, 1.1 km away"*).

### Module 7: Anonymous Real-Time Chat & Identity Reveal Handshake
- **Socket.IO Real-Time Engine:** Sub-second bi-directional message transfer, typing status, and read indicators.
- **Anonymous Mode by Default:**
  - Users are masked with whimsical pseudonyms (*"Shadow Striker"*, *"BadminPro #42"*, *"Campus Hawk"*).
  - Masked avatars with 3D aesthetic inspired by Meshy AI.
  - Personal contact info, real names, and profile pictures are completely hidden.
- **Dual-Consent "Reveal Identity" Handshake:**
  1. Either participant clicks **"Request Identity Reveal"**.
  2. The other user receives a modal prompt: *"Participant wants to unveil identities. Do you accept?"*.
  3. When both approve, a celebratory animation plays (Swishy AI animation style), the thread updates to `isRevealed: true`, and verified real profiles and contact links are permanently unlocked.

### Module 8: Notification Center
- Real-time and persistent alerts for:
  - New nearby activity requests matching user hobbies.
  - Chat messages and direct mentions.
  - Identity reveal requests and acceptances.
  - Activity status updates (e.g., request filled or completed).

### Module 9: Safety, Privacy & Moderation System
- **User Blocking:** Instant block action in chat/profiles. Blocked users cannot message, view requests, or appear in geospatial queries.
- **User & Request Reporting:** Form with categories: *Harassment*, *Spam*, *Inappropriate Offline Behavior*, *Impersonation*.
- **Location Fuzzing:** Optional setting to add a ~400m jitter to user coordinates to protect residential privacy.

### Module 10: Community Hotspots & Stats Dashboard
- Pre-configured local community and campus activity hotspots.
- Live counters for active requests, connected peers, and popular activities.

---

## 5. Non-Functional Requirements & Success Criteria

1. **Performance:** Radius query response time < 100ms; WebSocket message transit < 50ms.
2. **Security:** NoSQL injection prevention via Mongoose schema sanitization; bcrypt password hashing; JWT stateless verification.
3. **Accessibility:** WCAG 2.1 AA color contrast compliance ($\ge 4.5:1$); touch targets $\ge 44 \times 44$ px; mobile-responsive from 320px to 4K displays.
4. **Reliability:** Graceful handling of denied geolocation permissions with interactive map fallback.
