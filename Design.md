# Visual Design System & Frontend Specifications - Connect2Go

**Brand:** Connect2Go  
**Tagline:** *"People Nearby. Activities Together."*  
**Alternative Supporting Phrase:** *"Find Your People. In The Real World."*  
**Design Philosophy:** *"Spotify's friendliness + Airbnb's clean UI + modern Gen-Z community app + calm wellness-inspired visual language"*  
**Version:** 2.0.0 (Production Design System)  
**Status:** Canonical Design Reference — Strict Adherence Mandatory

---

## 1. Design Direction & Core Ethos

Connect2Go is a location-based socializing and activity-partner platform:
$$\text{Find nearby people} \longrightarrow \text{Discover common activities} \longrightarrow \text{Connect safely} \longrightarrow \text{Chat} \longrightarrow \text{Meet in the real world}$$

### Visual & Emotional Tone
- **Calm, Peaceful & Trustworthy:** Soft white backgrounds, generous whitespace, relaxed typography.
- **Friendly & Human-Centered:** Warm micro-copy, authentic activity imagery, approachable rounded edges.
- **Fresh & Gen-Z Native:** Clean minimalist layouts, bento discovery, subtle badges, zero corporate clutter.
- **Safety-First & Reassuring:** Transparent privacy indicators, calm non-alarmist safety controls.

### Explicit Anti-Patterns (Strictly Avoid)
- **NO Generic Social Media Clutter:** Do NOT look like Facebook feeds, Instagram profile grids, or Tinder swiping decks.
- **NO Corporate Dashboards:** Avoid dark dense enterprise tables, harsh data grids, or multi-nested menus.
- **NO Harsh Visuals:** Avoid neon gradients, harsh drop-shadows, sharp 90-degree rectangular cards, or over-saturated backgrounds.
- **NO Distracting Motion:** Avoid constant floating elements, aggressive parallax, or flashy particle chaos. Animations must remain calm, subtle, and intentional.

---

## 2. Official Brand & Logo Standards

- **Brand Name:** `Connect2Go`
- **Logo Symbol:** A soft geolocation pin enveloping two connecting people across a shared winding path, crowned with gentle optimistic sun rays.
- **Brand Assets:**
  - `design-assets/Png logo.png` & `frontend/src/assets/logo.png` (Transparent PNG)
  - `design-assets/Normal Logo.png` & `frontend/src/assets/logo-normal.png` (High-res full logo)
  - `design-assets/Favicon.png` & `frontend/public/favicon.png` (Rounded App Icon)
  - `design-assets/Ui.png` & `frontend/src/assets/ui-mockup.png` (Official UI Layout Sheet)
- **Logo Usage Consistency:** Rendered with crisp SVG/PNG dimensions in:
  - Landing Page Header & Footer
  - Desktop Navbar & Mobile Top Header
  - Authentication Screens (Login & Sign Up)
  - Dashboard Sidebar Top Anchor
  - Application Loading States & Empty States

---

## 3. Color System & Semantic Tokens

Green is our primary brand anchor, communicating freshness, outdoor vitality, health, and trust.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRIMARY EMERALD      SECONDARY GREEN      MINT SURFACE      VERY LIGHT MINT │
│      #22C55E              #16A34A            #A7F3D0             #ECFDF5     │
│  Main CTAs & Brand     Hover & Pressed     Soft Badges      Subtle Background│
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│   CANVAS BG             CARD WHITE          BORDER SLATE       DARK TEXT     │
│    #F8FAFC               #FFFFFF              #E2E8F0           #0F172A      │
│  Soft Canvas Body      Elevated Cards       Thin Dividers      Primary Copy  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Core Palette Tokens
| Token Name | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| `--color-primary` | `#22C55E` | Main action buttons (`[Get Started]`, `[Join]`, `[Post Request]`), active states |
| `--color-primary-hover` | `#16A34A` | Button hover/active states, primary icon fills |
| `--color-mint` | `#A7F3D0` | Soft tag backgrounds, interest pill borders, subtle badge fills |
| `--color-mint-light` | `#ECFDF5` | Subtle notification highlights, incoming message bubbles |
| `--color-bg-canvas` | `#F8FAFC` | Main application background (calm, soft off-white) |
| `--color-card-bg` | `#FFFFFF` | Approachable white card surfaces with thin borders |
| `--color-border` | `#E2E8F0` | Delicate 1px borders for cards, inputs, and dividers |
| `--color-text-dark` | `#0F172A` | Primary headings and main reading text (high legibility) |
| `--color-text-secondary`| `#475569` | Meta descriptions, distances, dates, secondary labels |
| `--color-text-muted` | `#94A3B8` | Placeholders, disabled states, unobtrusive timestamps |

### 3.2 Sparing Accent Tokens (Use with Restraint)
*Rule: Never use all accent colors simultaneously. Green must dominate.*
- **Soft Amber (`#F59E0B`):** Time-sensitive tags, pending approval, warning notices.
- **Soft Pink (`#EC4899`):** Community & social hobby tags, favorite heart toggles.
- **Soft Red (`#EF4444`):** Calm destructive actions (Leave activity, Report, Block).

---

## 4. Typography Hierarchy (Plus Jakarta Sans)

- **Primary Font Family:** `Plus Jakarta Sans`, sans-serif (Fallback: `Inter`, sans-serif).
- **Aesthetic Feel:** Modern, friendly, rounded, clean, Gen-Z appealing, highly legible.
- **Rules:** Avoid ultra-thin weights (< 400). Avoid excessive uppercase. Use medium (500) and semibold (600) for structured hierarchy.

| Style Level | Size | Weight | Line Height | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px` - `44px` | 700 (Bold) | `1.15` | Landing page hero headline |
| **Section Title (H1)**| `26px` - `30px` | 700 (Bold) | `1.25` | Dashboard greetings, modal headers |
| **Card Title (H2)** | `18px` - `20px` | 600 (SemiBold) | `1.35` | Activity names, user names |
| **Subheading (H3)** | `15px` - `16px` | 600 (SemiBold) | `1.4` | Section subtitles, filter categories |
| **Body Text** | `15px` - `16px` | 400 (Regular) | `1.5` | Descriptions, chat messages, form labels |
| **Small / Meta** | `13px` - `14px` | 500 (Medium) | `1.4` | Distance (km), date/time, participant count |
| **Badge / Caption** | `11px` - `12px` | 600 (SemiBold) | `1.2` | Category pills, match %, status badges |

---

## 5. Shape, Spacing & Elevation System

### 5.1 Border Radius Scale
Approachability is driven by soft, generous curves:
- **Small (`10px`):** Inner form inputs, dropdown options, inner badges.
- **Medium (`14px`):** Action buttons, category filter pills, list items.
- **Large (`20px`):** Activity cards, person cards, chat bubbles, sidebar containers.
- **Extra Large (`28px`):** Modals, hero image containers, bottom navigation sheets.
- **Full (`9999px`):** Avatars, status pills, circular action buttons.

### 5.2 Soft Shadows & Borders
- **Standard Card Shadow:** `0 8px 30px rgba(15, 23, 42, 0.06)`
- **Hover Card Elevation:** `0 14px 36px rgba(34, 197, 94, 0.10)` (gentle emerald glow)
- **Borders:** Thin, crisp `1px solid #E2E8F0`.

---

## 6. Responsive Layout Breakpoints

The UI adapts gracefully across all viewports without simply scaling:

| Screen Tier | Width Range | Layout Structure | Navigation Paradigm |
| :--- | :--- | :--- | :--- |
| **Mobile** | `375px` – `430px` | Single column stacked, swipeable horizontal card trays | Sticky compact header + Floating Bottom Navigation |
| **Tablet** | `768px` – `1024px` | 2-column discovery grid, collapsible sidebar | Compact sidebar or top navigation |
| **Laptop** | `1280px` – `1440px` | Left sidebar + multi-column discovery feed (Max width `1320px`) | Persistent vertical sidebar |
| **Desktop** | `1920px` | Centered max-width container (`1400px`) with balanced gutters | Full desktop sidebar + rich map/card split |

---

## 7. Comprehensive Screen Blueprint

### 7.1 Landing Page
- **Hero Left:**
  - Headline: *"Real People. Real Activities. **Near You.**"* (with *"Near You"* highlighted in `#22C55E`).
  - Supporting Copy: *"Discover people who share your interests, join activities, and build meaningful connections — offline."*
  - Primary CTA: `[Get Started]` (Emerald rounded pill button).
  - Secondary CTA: `[Explore Activities]` (Outlined soft button).
  - Social Proof Metrics: `10K+ Active Users` • `500+ Activities Every Week` • `25+ Cities`.
- **Hero Right:**
  - Modern authentic lifestyle photo collage with rounded corners (`28px`).
  - Floating activity cards:
    - *"Morning Run • 0.8 km away • 5 people interested"*
    - *"Badminton Partner • 1.2 km away • 3 interested"*

### 7.2 Navbar
- **Left:** Connect2Go brand logo (Pin + Figures) + text mark.
- **Center Navigation:** `Home` • `Explore` • `How It Works` • `About`.
- **Right Action:** `Login` (text link) + `[Sign Up]` (primary green button).
- **Styling:** Sticky header with subtle backdrop blur (`backdrop-blur-md bg-white/80`).

### 7.3 Discovery / Home Dashboard
- **Sidebar (Desktop):**
  - Brand logo at top.
  - Links: `Home`, `Explore`, `Create Request`, `Messages` (with unread badge), `Notifications`, `Profile`, `Settings`.
- **Main Feed Header:**
  - Greeting: *"Good evening, Kinshuk 👋"*
  - Subtitle: *"Find something fun to do nearby."*
  - Interactive Location Selector: `📍 Jaipur, Rajasthan ▾`
  - Radius Selector: `Within 5 km ▾`
  - Search Input: `"Search activities, people or interests..."` (with Lucide `Search` icon).
- **Category Filter Pills:** `All` • `Sports` • `Fitness` • `Gaming` • `Study` • `Food` • `Travel` • `Others`.
- **Activity Cards Display:**
  - Lifestyle photo banner with rounded top.
  - Activity name (e.g., *"Badminton Partner"*).
  - Metadata badges: Distance (`1.2 km away`), Date (`Today, 6:00 PM`), Quota (`2/4 joined`).
  - Primary action: `[Join]` button + subtle Favorite heart icon.

### 7.4 "People Near You" Component
- Horizontal scrolling carousel of friendly peer avatars.
- Circular profile image + online presence dot.
- Name (e.g., *"Rohan"*), distance (`2.1 km`), and common interest badge (*"3 common interests"*).
- Dedicated focus: Community and activity companionship, **strictly non-dating**.

### 7.5 Create Activity Request Form
- Title: *"Create Activity Request"*
- Subtitle: *"Find the right people for your next activity."*
- Fields:
  - Activity Type (Searchable dropdown with friendly category icons).
  - Date & Time pickers.
  - Location (Toggle: *"Use my current location"* + custom landmark input).
  - Radius Slider ($0.5\text{ km}$ to $25\text{ km}$).
  - Description textarea with placeholder (*"Looking for a badminton partner. Intermediate level preferred."*).
- CTA: `[Post Request]` (full-width emerald button).

### 7.6 User Profile
- Header: Soft banner + circular avatar + verified check.
- Name (`Kinshuk Khandelwal`), Username (`@kinshuk`), Location (`📍 Jaipur, Rajasthan`).
- Bio: *"Tech enthusiast. Love sports, travel and meeting new people!"*
- Stats Row: `12 Activities` • `8 Matches` • `24 Connections`.
- Interests: Soft green mint tags (`#ECFDF5` background, `#16A34A` text):
  `Badminton` `Running` `Gaming` `Music` `Travel` `Photography`.
- Availability Matrix: Badges for preferred days and time windows.
- CTA: `[Edit Profile]`.

### 7.7 Matches ("People You May Connect With")
- Non-romantic, activity-driven buddy discovery.
- Cards displaying profile image, name, distance, common interests (*"Badminton • Running • Fitness"*), and compatibility score.
- Actions: `[Chat]` (primary green) and `[View Profile]`.

### 7.8 Anonymous Real-Time Chat
- Header: *"Anonymous Chat"* with lock icon and subtitle: *"Your personal details aren't shared yet."*
- Privacy Notice Banner: *"You can choose when to share your personal information through the Reveal Identity handshake."*
- Message Bubbles:
  - Incoming: Soft mint/gray bubble (`#F1F5F9` or `#ECFDF5`) on left.
  - Outgoing: Brand emerald bubble (`#22C55E` with white text) on right.
- Input Bar: Rounded input field (`"Type a message..."`) + circular green send button with Lucide `Send` icon.

### 7.9 Notifications Center
- Clean uncluttered notification items with contextual icons:
  - *"Rohan is interested in your activity request."*
  - *"You have a new anonymous message."*
  - *"Priya liked your activity."*
  - *"Your activity request expires tomorrow."*
  - *"New people nearby match your interests."*

### 7.10 Settings & Safety
- Clean list items: `Account`, `Privacy Controls`, `Location Settings`, `Notifications`, `Blocked Users`, `Help & Support`, `Logout`.
- Calm explanatory language: *"Your location is used to discover relevant activities nearby. You can enable location fuzzing anytime to protect your home privacy."*

---

## 8. State Patterns: Empty & Loading States

### 8.1 Empty States
- Friendly vector illustration or soft icon in a mint circle.
- Empathetic copy: *"No activities nearby yet."*
- Suggestion: *"Try increasing your search radius or create your own activity to start connecting."*
- Action CTA: `[Create Activity]`.

### 8.2 Loading States
- **Skeleton Loaders Only:** Subtle shimmering skeleton blocks matching the exact shape of cards, avatars, and text rows.
- No jarring spinners that block the viewport.

---

## 9. Micro-Interactions & Animation Guidelines

- **Buttons:** Subtle scale down on tap/press (`scale-95`), soft emerald shadow expansion on hover.
- **Activity Cards:** Gentle elevation on hover (`translate-y-[-4px]` with shadow transition).
- **Navigation:** Fluid animated indicator bar under active route.
- **Modals:** Soft scale-and-fade entrance using spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Revealed Handshake:** Celebratory gentle confetti/burst animation when both users unlock profiles.
- **Timing:** Micro-interactions must complete in `150ms` – `250ms`.

---

## 10. Reusable Component Inventory

Developers must construct pages exclusively using these unified, modular components:

1. `Button` (Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`)
2. `Input` & `Textarea` (Rounded, soft border, emerald focus ring)
3. `Select` & `Dropdown`
4. `Modal` / `Dialog` (Accessible backdrop with spring animation)
5. `Avatar` (Variants: real photo, 3D Meshy anonymous silhouette, status ring)
6. `Badge` & `InterestTag` (Mint soft badge with icon)
7. `ActivityCard` (Bento layout, distance tag, participant meter, join CTA)
8. `PersonCard` (Avatar, distance, common interest count, chat button)
9. `SearchBar` (Debounced input with clear icon)
10. `Navbar` & `Sidebar` (Desktop layout)
11. `BottomNavigation` (Mobile 5-tab sticky bar)
12. `NotificationCard` (Icon, timestamp, read status)
13. `ChatBubble` (Incoming vs outgoing styling)
14. `EmptyState` (Friendly graphic, supportive title, action button)
15. `Skeleton` (Card skeleton, avatar skeleton, text skeleton)
16. `LocationSelector` & `RadiusSelector`

---

## 11. Core UX Check Before Every Page

Before developing any screen, verify the **6 User Clarities**:
1. **Where am I?** (Clear header, active nav tab, location indicator)
2. **What can I do here?** (Single prominent primary action)
3. **Who is nearby?** (Visual distance tags and participant avatars)
4. **What activities are available?** (Scannable category badges and clear cards)
5. **How can I connect?** (Single-click Join or Chat action)
6. **Is my information safe?** (Anonymous indicators and privacy badges)
