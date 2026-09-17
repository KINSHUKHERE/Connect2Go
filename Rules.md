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

### Backend Libraries
- **Runtime:** Node.js (v20+ / v22+).
- **Web Server:** Express.js (`express`).
- **Real-Time Gateway:** `socket.io` (v4+).
- **Database Driver:** `mongoose` (v8+) connected to local or remote MongoDB.
- **Authentication & Security:** `jsonwebtoken` (JWT), `bcryptjs`, `cors`, `helmet`.
- **Environment Management:** `dotenv`.

---

## 2. Forbidden Libraries & Anti-Patterns (DO NOT USE)

| Forbidden Technology | Reason for Prohibition | Approved Replacement |
| :--- | :--- | :--- |
| **jQuery** | Obsolete DOM manipulation; conflicts with React Virtual DOM | Native React state & hooks |
| **Redux Boilerplate** | Massive overkill for this project scope; creates unnecessary complexity | React Context API (`AuthContext`, `SocketContext`, `GeoContext`) |
| **Google Maps JS API** | Requires Google Cloud Billing account, credit card, and paid API keys | OpenStreetMap + Leaflet (`react-leaflet`) |
| **Bootstrap / Material UI (MUI)** | Clunky, heavy CSS stylesheets that conflict with modern Tailwind & Bento aesthetics | Tailwind CSS + `shadcn/ui` + `Watermelon UI` |
| **Raw SQL / SQLite** | Project specification and minor project synopsis mandate MongoDB with GeoJSON | MongoDB with Mongoose `2dsphere` |
| **Emoji as Primary Icons** | Inconsistent rendering across Windows/Mac/Android, lacks accessibility | `lucide-react` SVGs |
| **Inline Hardcoded Secrets** | Security vulnerability | `process.env` / `.env` variables |

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
1. **Geolocation Fallback:** Never crash or freeze if the browser denies GPS permissions. Catch `navigator.geolocation.getCurrentPosition` errors and automatically set default fallback coordinates (Poornima University Campus: `[26.7725, 75.8753]`) with an informative banner informing the user they can manually drag the pin.
2. **WebSocket Reconnection:** Configure `socket.io-client` with automatic reconnection attempts (`reconnection: true`, `reconnectionDelay: 1000`).
3. **User Feedback:** Use toast notifications for success and error alerts; never use intrusive native `alert()` or `prompt()` dialogs.

---

## 4. UI/UX Pro Max Rules & Accessibility Guidelines

1. **Touch Targets:** All interactive elements (buttons, sliders, toggles, map markers) MUST have a minimum tap area of **$44 \times 44\text{ px}$**.
2. **Contrast Standards:** Follow WCAG 2.1 AA contrast requirements:
   - Normal text: Minimum contrast ratio of **4.5:1** against the background.
   - Large text / Badges: Minimum contrast ratio of **3.0:1**.
   - Do NOT use low-contrast gray-on-gray body text.
3. **Responsive Breakpoints:**
   - Mobile-First layout: Single column feed on screens $< 768\text{px}$.
   - Split screen on desktop $\ge 1024\text{px}$: Left panel for interactive map with radar radius visualizer; right panel for Bento grid of matching requests.
   - Zero horizontal page scrolling (`overflow-x: hidden`).
4. **State Indicators:** Every network request must provide visible feedback:
   - Skeletons or pulse spinners during data fetching.
   - Disabled states with visual opacity during form submissions.
   - Distinct typing indicator in chat threads.

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
2. **Pre-seed Demo Data:** Always include the demo seed dataset featuring Poornima University / Sitapura campus peers (Kinshuk, Kirti, Lavanshu, Lavish) with active requests (Badminton, Hackathon, Cycling, Study Session) so the application is instantly demonstrable for academic viva and evaluation.
3. **No Code Truncation:** Do not leave placeholder comments like `// implement logic here` or `// todo`. Every file must be complete, syntactically valid, and functional.
4. **Zero Console Errors:** The frontend and backend must compile cleanly with zero unhandled exceptions or critical lint warnings.
