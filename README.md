# VoiceNote2Task ✨

> **Turn messy, rambling voice memos into structured, actionable tasks — 100% client-side, zero API keys, zero data leaks.**

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=reactrouter)](https://reactrouter.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ What It Does

Paste or dictate a stream-of-consciousness voice memo like:

> *"Uh hey, so I really need to call Sarah tomorrow morning about the Q3 budget report, and oh yeah don't forget to buy oat milk tonight, also there's an urgent bug fix on the payment webhook ASAP before Friday…"*

And VoiceNote2Task extracts:

| Task | Category | Priority | Due Date |
|------|----------|----------|----------|
| Call Sarah about Q3 budget report | Work | Normal | Tomorrow morning |
| Buy oat milk | Shopping | Normal | Tonight |
| Fix payment webhook bug | Dev/Tech | 🔥 High | Friday |

---

## 🚀 Features

### Core NLP Engine
- **Filler Word Stripping** — removes "uh", "um", "I really need to", "don't forget to", etc.
- **Due Date Extraction** — parses "tomorrow morning", "next Tuesday at 3pm", "by EOD Friday" into exact ISO timestamps
- **Priority Detection** — ASAP, urgent, critical → High priority automatically
- **Smart Categorization** — Work, Dev/Tech, Finance, Shopping, Health, Communication
- **ICS Calendar Export** — export tasks as `.ics` files for any calendar app

### Authentication (Fake/Demo)
- **Protected Routes** — `/tasks` requires authentication; unauthenticated users are redirected to login
- **Sign In / Sign Up** — client-side fake auth stored in `localStorage` — no server needed
- **1-Click Demo Profiles** — instantly switch between pre-built demo accounts (Alex Morgan, Marcus Vance)
- **Persistent Sessions** — auth state survives page reloads via `localStorage`
- **Guest Mode** — sign out to experience the auth wall and protected route redirect

### Task Management
- **Action Form** — async form submission with a full-screen animated loader while NLP parses your memo
- **Skeleton Loaders** — shimmering placeholder cards shown on route transition for polished UX
- **Filter Pills (v2)** — redesigned pill-style filter buttons with emoji icons, task counts, and smooth animations:
  - **Status**: 🗂️ All / ⏳ Pending / ✅ Done
  - **Priority**: 🎯 All / 🔥 Urgent / 🔵 Normal
  - **Sort**: ⬇️ Default / 🔥 Urgent First / 📅 Due Date / 🔤 A–Z
  - **Category Chips**: emoji-decorated chips with live task counts and active glow states
- **Inline Search** — real-time search across task title, category, raw text, and date fields, with a one-click clear
- **Active Filter Summary** — shows "Showing X of Y tasks" and a Reset All Filters button when filters are active
- **CRUD Operations** — add, edit, delete tasks; mark complete/pending
- **Clear Done / Clear All** — bulk task management actions

### UI / Design
- **Glassmorphism Dark Theme** — deep dark `#0a0d14` base with layered glass cards
- **Ambient Glow Mesh** — animated floating orbs in the background for depth
- **Micro-animations** — hover lifts, scale transitions, filter pill glow on active
- **Responsive** — works across all screen sizes

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── AuthModal.jsx        # Sign in / Sign up / Demo profiles modal
│   ├── ExportModal.jsx      # ICS/CSV export dialog
│   ├── Icons.jsx            # SVG icon library
│   ├── Loader.jsx           # ParseLoader, Skeleton cards, Spinner ← NEW
│   ├── Navbar.jsx           # Sticky nav with user profile dropdown
│   ├── ProtectedRoute.jsx   # Auth guard for /tasks ← NEW
│   ├── TaskCard.jsx         # Individual task card with actions
│   ├── TaskEditModal.jsx    # Create/Edit task form modal
│   └── TaskStats.jsx        # Stats bar (total, pending, completed, urgent)
├── context/
│   └── AuthContext.jsx      # Auth state, login/signup/logout, modal control
├── pages/
│   ├── Home.jsx             # Voice memo input + action form with ParseLoader
│   └── Tasks.jsx            # Task list with v2 filter pills + skeleton loader
├── utils/
│   ├── authStorage.js       # localStorage helpers for auth
│   ├── icsGenerator.js      # ICS file builder
│   ├── parser.js            # Client-side NLP heuristics engine
│   ├── samples.js           # Sample voice note presets
│   └── storage.js           # Task + history localStorage helpers
├── App.jsx                  # Router with ProtectedRoute wrapping /tasks
├── index.css                # Design system, filter pills, skeleton shimmer
└── main.jsx                 # React entry point
```

---

## 🔐 Fake Authentication Flow

This project uses **client-side fake authentication** — no backend required.

| Event | What Happens |
|-------|-------------|
| Visit `/` unauthenticated | CTA button shows "🔐 Sign In to Organise" |
| Click CTA or navigate to `/tasks` | Auth modal opens automatically; redirected to `/` |
| Sign In with any email | Creates/finds a user profile, stores in localStorage |
| Sign Up | Creates new profile with your name + role |
| Demo Profile | 1-click login as Alex Morgan or Marcus Vance |
| Sign Out | Clears session; `/tasks` becomes protected again |

**Test credentials** (pre-seeded):
- Email: `alex.morgan@ambient.design` → logs in as Alex Morgan
- Email: `marcus.vance@techcorp.io` → logs in as Marcus Vance
- Any other email → creates a new custom profile

---

## 🎨 Filter Bar (v2)

The filter bar on `/tasks` was completely redesigned with:

- **Pill-style buttons** with `border-radius: 9999px` and gradient active state
- **Emoji icons** on every filter for instant visual recognition
- **Live task counts** shown as mini badges inside each status pill
- **Smooth hover animations** with `translateY(-1px)` and purple glow
- **Active filters summary** row showing result count and one-click Reset All
- **Inline search clear button** (✕) appears when search is active
- **Filter divider** between Status and Priority sections

---

## ⚡ Loader / Action Form Pattern

```
User submits form
  → isParsing = true
  → ParseLoader overlay fades in (animated emoji logo + bouncing dots)
  → 700ms simulated async delay
  → parseVoiceNote() runs (synchronous NLP)
  → isParsing = false
  → Navigate to /tasks with results in router state
```

On `/tasks` first mount:
- 600ms skeleton shimmer cards are shown
- Then real TaskCards animate in

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173).

**Quick Start:**
1. Click **"Demo Profiles"** in the navbar and pick a demo account
2. Type or paste a rambling voice note (or click a sample preset)
3. Click **"Organise Tasks"** — watch the loader, then see your tasks!
4. Use the **filter pills** to slice by status, priority, or category

---

## 🧩 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI components |
| React Router v6 | 6.30 | SPA routing + protected routes |
| Vite | 8 | Build tool + HMR |
| Vanilla CSS | — | Design system, animations, glassmorphism |
| localStorage | — | Auth sessions + task persistence |
| Web Speech API | — | Browser-native voice dictation |

---

## 📄 License

MIT © VoiceNote2Task Contributors
