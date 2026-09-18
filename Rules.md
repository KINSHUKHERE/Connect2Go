# AI Engineering Rules & Project Guardrails - Connect2Go

**Project Name:** Connect2Go (*"Nearby Connect"*)  
**Version:** 1.0.0  
**Scope:** Strict execution guidelines and boundaries for AI agents and developers.

---

## 1. Approved Technology Stack & Allowed Libraries

### Frontend Libraries
- **Build Tool:** Vite (`vite@latest` with React plugin).
- **Core Framework:** React 19 / 18 with functional components and modern hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef`).
- **Styling & CSS:** Tailwind CSS v3 / v4 with PostCSS & Autoprefixer.
- **UI Components:**
  - `shadcn/ui` primitive components (built on Radix UI or lightweight accessible primitives).
  - `Watermelon UI` (`https://ui.watermelon.sh/`) patterns for cards, segmented switches, and action sheets.
  - `React Bits` (`https://reactbits.dev`) for interactive micro-animations, text effects, and particle/ambient backgrounds.
  - `21st.dev` (`https://21st.dev/community/components`) patterns for bento grids, activity badges, and modern feed layouts.
- **Animations:**
  - `Swishy AI` (`http://swishy.ai`) inspired fluid transition physics for modals, reveal celebrations, and slide-overs.
  - CSS keyframes and lightweight transition utilities.
- **3D & Avatar Assets:**
  - `Meshy AI` (`http://meshy.ai`) design aesthetic for anonymous 3D stylized avatars and activity icons.
- **Icons:** `lucide-react` (clean, accessible SVG icons).
- **Interactive Mapping:** `leaflet` and `react-leaflet` with OpenStreetMap raster tiles (requires **zero API keys** and **no credit cards**).
- **Networking & Real-Time:** `axios` for HTTP REST calls; `socket.io-client` for real-time WebSocket communication.

### Backend & Cloud Infrastructure
- **Runtime:** Node.js (v20+ / v22+).
- **Backend Framework:** Express.js (`express`) for core algorithms (matching engine, identity reveal handshake).
- **Database:** Supabase (Managed PostgreSQL with PostGIS extension for spatial queries).
- **Client SDK:** `@supabase/supabase-js` (v2+).
- **Authentication:** Supabase Auth (Email/Password & Google OAuth 2.0).
- **Media & Photo Storage:** Cloudinary (CDN-optimized image delivery, face-centered cropping, auto-WebP transformations).
- **Real-Time Gateway:** Supabase Realtime & Socket.IO (v4+).
- **Environment Management:** `dotenv`.

---

## 2. Forbidden Libraries & Anti-Patterns (DO NOT USE)

| Forbidden Technology | Reason for Prohibition | Approved Replacement |
| :--- | :--- | :--- |
| **jQuery** | Obsolete DOM manipulation; conflicts with React Virtual DOM | Native React state & hooks |
| **Redux Boilerplate** | Massive overkill for this project scope; creates unnecessary complexity | React Context API (`AuthContext`, `GeoContext`, `ChatContext`) |
| **Google Maps JS API** | Requires Google Cloud Billing account, credit card, and paid API keys | OpenStreetMap + Leaflet (`react-leaflet`) |
| **Bootstrap / Material UI (MUI)** | Clunky, heavy CSS stylesheets that conflict with modern Tailwind & Bento aesthetics | Tailwind CSS + `shadcn/ui` + `Watermelon UI` |
| **Local File System Storage for Images** | Inefficient, breaks in serverless/cloud environments | Cloudinary CDN |
| **Emoji as Primary Icons** | Inconsistent rendering across Windows/Mac/Android, lacks accessibility | `lucide-react` SVGs |
| **Inline Hardcoded Secrets** | Critical security vulnerability | `process.env` / `.env` variables |

---

## 3. Error Handling & Resilience Standards

### 3.1 Backend Error Handling
1. **Centralized Middleware:** All controllers MUST forward asynchronous errors using `next(err)` or `express-async-errors`.
2. **Predictable JSON Response Structure:** All API responses must adhere to:
   ```json
   {
     "success": true,
     "message": "Activity request created successfully",
     "data": { ... }
   }
   ```
   Or on error:
   ```json
   {
     "success": false,
     "message": "Invalid radius parameter. Must be between 0.5 and 50 km.",
     "error": "VALIDATION_ERROR"
   }
   ```
3. **No Uncaught Exceptions:** All database transactions and geospatial `$near` queries must be wrapped in try-catch blocks with helpful fallback responses.

### 3.2 Frontend Error Handling
1. **Geolocation Fallback:** Never crash or freeze if the browser denies GPS permissions. Catch `navigator.geolocation.getCurrentPosition` errors and automatically set default fallback coordinates (`[26.7725, 75.8753]`) with an informative banner informing the user they can manually drag the pin.
2. **WebSocket Reconnection:** Configure `socket.io-client` with automatic reconnection attempts (`reconnection: true`, `reconnectionDelay: 1000`).
3. **User Feedback:** Use toast notifications for success and error alerts; never use intrusive native `alert()` or `prompt()` dialogs.

---

## 4. Senior UI/UX & Frontend Engineering Rules (Gen-Z Calm Social Discovery)

### 4.1 Visual Feel & Design Ethos
- **The Core Feel:** *"Spotify's friendliness + Airbnb's clean UI + modern Gen-Z community app + calm wellness-inspired visual language"*.
- **Anti-Patterns:**
  - DO NOT make it look like Facebook, Instagram, Tinder, or a corporate dashboard template.
  - NO excessive gradients, neon colors, heavy glassmorphism, or sharp rectangular cards.
  - NO cluttered layouts, huge text everywhere, or visually heavy shadows.
  - Use whitespace generously and intelligently.

### 4.2 Exact Color Rules
- **Brand Green:** Primary `#22C55E` (Emerald), Secondary `#16A34A`. Green MUST remain the dominant brand anchor.
- **Mints:** Soft Mint `#A7F3D0`, Very Light Mint `#ECFDF5`.
- **Neutrals:** Primary Text `#0F172A`, Secondary Text `#475569`, Background Canvas `#F8FAFC`, White Cards `#FFFFFF`, Thin Borders `#E2E8F0`.
- **Restrained Accents:** Sparing use of Soft Amber (`#F59E0B`), Soft Pink (`#EC4899`), Soft Red (`#EF4444`). Never use all accents simultaneously.

### 4.3 Typography & Shapes
- **Typography:** `Plus Jakarta Sans` (Fallback: `Inter`). Modern, friendly, rounded, clean, highly readable.
  - Body text $\approx 16\text{px}$. Small text $13\text{--}14\text{px}$.
  - Medium and semibold weights for importance. Avoid ultra-thin fonts and excessive all-caps.
- **Border Radius Scale:**
  - Small: `10px` (inputs, dropdowns)
  - Medium: `14px` (buttons, filter pills)
  - Large: `20px` (activity cards, chat bubbles, sidebar containers)
  - Extra Large: `28px` (modals, hero containers, bottom navigation sheets)
- **Soft Shadows:** Standard subtle elevation `0 8px 30px rgba(15, 23, 42, 0.06)`. Never use visually heavy shadows.

### 4.4 Responsive Layout Contracts
- **Mobile (375px – 430px):** Sticky compact header, floating bottom navigation, large tap targets ($\ge 44 \times 44\text{px}$), swipeable card trays, full-width buttons.
- **Tablet (768px – 1024px):** 2-column discovery grid, collapsible or compact navigation.
- **Laptop & Desktop (1280px – 1920px):** Structured vertical sidebar, multi-column discovery feed, max container width of `1280px` – `1400px`.

### 4.5 Component-First Architecture (Never Write Giant Monolithic Files)
All pages MUST be assembled from modular, reusable components:
- `Button`, `Input`, `Select`, `Modal`, `Avatar`, `Badge`, `ActivityCard`, `PersonCard`, `InterestTag`, `SearchBar`, `Navbar`, `Sidebar`, `BottomNavigation`, `NotificationCard`, `ChatBubble`, `ProfileCard`, `EmptyState`, `Skeleton`, `LocationSelector`, `RadiusSelector`.
- Consistent Iconography: Exclusively use `lucide-react` (simple, rounded, minimal, consistent).

### 4.6 Animation & Motion Rules
- Animations must feel **CALM + SMOOTH + PREMIUM** (inspired by Swishy AI spring physics).
- Subtle hover elevations, smooth button presses, gentle modal fade/scale transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- NO constant floating elements, excessive parallax, or distracting background animations.

### 4.7 State Handling Standards
- **Loading States:** Strictly use skeleton loaders matching component layouts; avoid blocking spinners.
- **Empty States:** Friendly, encouraging graphics and supportive copy with a direct CTA (e.g. *"No activities nearby yet. Try expanding your radius or create your own!"*).

### 4.8 The 8-Step Pre-Implementation Rule
Before implementing ANY screen or component:
1. Understand the user goal.
2. Design the information hierarchy.
3. Establish the responsive layout.
4. Use modular reusable components.
5. Add calm, subtle animations.
6. Check mobile responsiveness.
7. Verify WCAG 2.1 AA accessibility.
8. Maintain the Connect2Go design tokens.

### 4.9 The 6 Core UX Questions Test
Every screen must make immediately clear:
1. *Where am I?*
2. *What can I do here?*
3. *Who is nearby?*
4. *What activities are available?*
5. *How can I connect?*
6. *Is my information safe?*
Every screen must feature **one clear primary action**.

---

## 5. Security & Privacy Guardrails

1. **Password Hashing:** Passwords MUST NEVER be stored in plain text. Always hash with `bcryptjs` using at least 10 rounds.
2. **Password Filtering:** Never return `password` in `User` queries. Always select `-password` in Mongoose queries.
3. **Location Privacy:** If a user has `isLocationFuzzed: true`, the API must add a randomized $\sim 400\text{m}$ offset to their broadcasted coordinates to prevent physical stalking.
4. **Anonymous Chat Protection:** When a conversation has `isRevealed: false`, the backend MUST scrub real user names, emails, and profile pictures from the response payload, replacing them strictly with masked aliases (e.g. *"BadminPro #42"*) and anonymous 3D avatars.
5. **NoSQL Injection Prevention:** Sanitize all query filters; never pass unvalidated `req.body` directly into MongoDB query operators.

---

## 6. AI Development Rules of Engagement

1. **Never Hallucinate Endpoints:** Follow the explicit REST and WebSocket contracts defined in `Architecture.md`.
2. **Pre-seed Demo Data:** Always include the demo seed dataset featuring diverse active peers with sample requests (Badminton, Hackathon, Cycling, Study Session) so the application is instantly testable and demonstrable out-of-the-box.
3. **No Code Truncation:** Do not leave placeholder comments like `// implement logic here` or `// todo`. Every file must be complete, syntactically valid, and functional.
4. **Zero Console Errors:** The frontend and backend must compile cleanly with zero unhandled exceptions or critical lint warnings.
