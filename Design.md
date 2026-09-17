# Visual Design System & UI/UX Specifications - Connect2Go

**Project Name:** Connect2Go (*"Nearby Connect"*)  
**Design Philosophy:** Dark Protective Minimalism + High-Energy Activity Accents + Bento Box Grid + Fluid Micro-interactions  
**Design Intelligence:** Powered by `ui-ux-pro-max-skill` (WCAG 2.1 AA Compliant)  
**Component Ecosystem:**
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Watermelon UI](https://ui.watermelon.sh/) + [React Bits](https://reactbits.dev) + [21st.dev](https://21st.dev/community/components)
- **Animations:** [Swishy AI](http://swishy.ai) inspired fluid spring physics & celebratory transitions
- **3D & Avatars:** [Meshy AI](http://meshy.ai) inspired 3D stylized avatars for anonymous personas

---

## 1. Visual Theme & Aesthetic Direction

Connect2Go combines a **protective, privacy-oriented dark aesthetic** (inspired by anonymous community platforms) with **high-energy sporting & activity accents** (vibrant indigo, emerald green, and coral).

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                                                                        │
   │  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
   │  │   Interactive Map     │   │      Bento Grid of Activities        │  │
   │  │                       │   │                                      │  │
   │  │   [Radar Radius Circle]   │   │  ┌──────────────┐ ┌──────────────┐  │  │
   │  │      (0.5km - 25km)   │   │  │ Badminton    │ │ Morning Ride │  │  │
   │  │                       │   │  │ 95% Match ★  │ │ 88% Match ★  │  │  │
   │  │   ● User Pin          │   │  │ 1.2 km away  │ │ 2.4 km away  │  │  │
   │  │   ▲ Activity Markers  │   │  └──────────────┘ └──────────────┘  │  │
   │  │                       │   │                                      │  │
   │  └───────────────────────┘   └──────────────────────────────────────┘  │
   │                                                                        │
   └────────────────────────────────────────────────────────────────────────┘
```

- **Primary Mode:** Dark Mode (OLED Deep Navy `#0B0F17`) to reduce eye strain, convey security/privacy during anonymous chat, and make vibrant activity markers pop.
- **Glassmorphism & Surface Elevation:** Subtle translucent backdrops (`rgba(17, 24, 39, 0.75)`) with `backdrop-blur-md` and 1px borders (`rgba(255, 255, 255, 0.08)`).
- **Layout Paradigm:** Modern **Bento Box Grid** layout (from 21st.dev) pairing rich interactive map controls with modular activity cards.

---

## 2. Color Palette & Semantic Design Tokens

### 2.1 Core Palette Tokens
| Token Name | Hex Code | RGB | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#0B0F17` | `11, 15, 23` | Deep space background canvas |
| `--bg-surface` | `#111827` | `17, 24, 39` | Primary card & sidebar background |
| `--bg-card` | `#161F30` | `22, 31, 48` | Bento card elevated background |
| `--border-subtle` | `#1F2937` | `31, 41, 55` | Dividers and card borders |
| `--border-focus` | `#6366F1` | `99, 102, 241` | Active input & selected card focus ring |
| `--text-primary` | `#F9FAFB` | `249, 250, 251`| Main headings and active body text (Contrast > 14:1) |
| `--text-secondary`| `#9CA3AF` | `156, 163, 175`| Meta labels, subtitles, timestamps (Contrast > 4.8:1) |
| `--text-muted` | `#6B7280` | `107, 114, 128`| Placeholders and disabled states |

### 2.2 Functional & Activity Accent Tokens
| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `--accent-brand` | `#6366F1` (Electric Indigo) | Primary CTA buttons, active tabs, radar radius circle |
| `--accent-success`| `#10B981` (Emerald Teal) | "Available Now" badge, 90%+ match score, revealed identity |
| `--accent-warning`| `#F59E0B` (Vibrant Amber) | 70-89% match score, pending requests, timer countdowns |
| `--accent-danger` | `#EF4444` (Rose Red) | Report button, block action, cancel request |
| `--accent-anon` | `#8B5CF6` (Mystic Purple) | Anonymous chat badges, pseudonym labels, masked mode |
| `--accent-sports` | `#3B82F6` (Sky Blue) | Sports category badge (Badminton, Cricket, Football) |
| `--accent-tech` | `#06B6D4` (Cyan) | Tech & Academic category badge (Coding, Hackathons, Study) |
| `--accent-social` | `#EC4899` (Hot Pink) | Social & Hobbies badge (Gaming, Coffee, Music) |

---

## 3. Typography & Hierarchy

### 3.1 Font Families
- **Display & Headings:** `Outfit`, sans-serif (Energetic, geometric, modern vibe for sports & activities).
- **Interface & Body:** `Inter` or `Plus Jakarta Sans`, sans-serif (Clean legibility, excellent tabular numbers for distances & timestamps).
- **Code & Pseudonyms:** `JetBrains Mono` / `Fira Code` (Used for anonymous tag badges like `#482`).

### 3.2 Type Scale
| Level | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `32px` (2rem) | `1.2` | 700 (Bold) | Welcome banner, primary page title |
| **Heading 1 (H1)** | `24px` (1.5rem) | `1.3` | 700 (Bold) | Section headers, modal titles |
| **Heading 2 (H2)** | `18px` (1.125rem)| `1.4` | 600 (SemiBold)| Activity card titles, category group headers |
| **Body (Default)** | `15px` (0.9375rem)| `1.5`| 400 (Regular) | Main descriptions, chat messages |
| **Body (Small)** | `13px` (0.8125rem)| `1.4` | 500 (Medium) | Distance metrics, timestamp, user metadata |
| **Caption / Badge**| `11px` (0.6875rem)| `1.2` | 600 (SemiBold)| Match % pills, status tags, radius pill |

---

## 4. UI Component Library Integration Specs

### 4.1 Watermelon UI (`https://ui.watermelon.sh/`)
- **Use Cases:**
  - **Segmented Control / Tab Switcher:** Seamless switching between "Interactive Map" and "Bento Grid".
  - **Action Sheets:** Mobile slide-up drawer for request creation and filter presets.
  - **Interactive Toggles:** "Available Right Now" live switch and "Location Fuzzing" privacy toggle.

### 4.2 React Bits (`https://reactbits.dev`)
- **Use Cases:**
  - **Animated Counter:** Dynamically counting up compatibility percentage (`0%` $\to$ `94%`).
  - **Ambient Glowing Border:** Highlights the top-recommended activity card with a subtle animated pulse gradient.
  - **Text Reveal / Typing Effect:** Displays the platform tagline: *"Find nearby peers. Connect through shared passions."*

### 4.3 21st.dev (`https://21st.dev/community/components`)
- **Use Cases:**
  - **Bento Activity Cards:** Asymmetric modular cards combining activity title, distance pill, author avatar, and skill tag.
  - **Faceted Filter Bar:** Sticky horizontal pill scroll with instant category icons.

### 4.4 shadcn/ui (`https://ui.shadcn.com/`)
- **Use Cases:**
  - **Dialogs & Modals:** `Dialog` primitive for "Create Activity Request", "Report User", and "Reveal Identity".
  - **Sliders:** Smooth accessible slider for the Radius Distance selector ($0.5\text{ km}$ to $25\text{ km}$).
  - **Badges:** Colored variant badges (`variant="secondary"`, `variant="outline"`).
  - **Avatars:** Masked anonymous silhouette with status ring.

### 4.5 Swishy AI (`http://swishy.ai`) Fluid Animations
- **Spring Physics Curves:**
  - Standard Ease: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy spring without bounce).
  - Celebration Reveal: Particle burst / confetti spring when both users accept the identity reveal handshake.
  - Map Pin Bounce: Pin gently drops and pulses when clicked.

### 4.6 Meshy AI (`http://meshy.ai`) 3D Avatar Aesthetics
- **Anonymous Persona Silhouettes:**
  - Stylized 3D geometric avatars (Polygon Fox, Cyber Falcon, Quantum Runner, Shadow Striker) rendered as crisp vector SVGs with gradient depth.
  - Generates playful intrigue while maintaining 100% user anonymity until the mutual reveal handshake.

---

## 5. Spacing, Grid & Layout System

- **Base Grid Unit:** $4\text{px}$ standard (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px).
- **Card Border Radius:** `rounded-2xl` ($16\text{px}$) for cards and modals; `rounded-full` for pills and action buttons.
- **Elevation / Shadows:**
  - Card Default: `shadow-sm shadow-black/40 border border-white/5`
  - Card Hover: `shadow-xl shadow-indigo-500/10 -translate-y-1 border-indigo-500/30 transition-all duration-200`
- **Touch Targets:** Minimum $44 \times 44\text{ px}$ for all tap targets on mobile.
