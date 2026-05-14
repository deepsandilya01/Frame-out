# 🎯 FRAME-OUT — COMPLETE HACKATHON PROJECT GUIDE (PART 1/3)
### By ADAPTrix | Final Round Preparation | Cinematic Noir Productivity Platform

---

## 📋 TABLE OF CONTENTS (Part 1)

1. [Project Overview & Pitches](#1-project-overview)
2. [Complete Architecture](#2-complete-architecture)
3. [File & Folder Breakdown](#3-file--folder-breakdown)
4. [Authentication Deep Dive](#4-authentication-deep-dive)
5. [Tech Stack Explained](#5-tech-stack-explained)

---

## 1. PROJECT OVERVIEW

### 🗣️ Easy Hinglish Explanation

Bhai, **Frame-Out** ek **premium productivity app** hai jo MERN stack pe bana hai. Simple words mein:

- **Problem:** Log aaj digital distractions mein khote ja rahe hain — Instagram Reels, YouTube Shorts, Twitter scroll. Productive rehna mushkil ho gaya hai.
- **Hamara Solution:** Ek all-in-one ecosystem — **Web App + Chrome Extension** — jo tumhe focus karne mein help karta hai, tumhari productivity track karta hai, aur tumhe **game ki tarah reward** karta hai.
- **Existing apps kya nahi karte:** Existing apps sirf timer dete hain (Pomofocus), ya sirf block karte hain (Cold Turkey). Koi bhi **ek hi jagah pe** sab kuch nahi karta — focus timer + distraction blocker + analytics + gamification + AI coach.

### ✅ USP (Unique Selling Propositions)

| Feature | Frame-Out | Others |
|---------|-----------|--------|
| Chrome Extension (Website Blocker) | ✅ Real-time blocking | ❌ |
| YouTube Shorts Blocker (content script) | ✅ DOM manipulation | ❌ |
| Instagram Reels Blocker | ✅ SPA nav listener | ❌ |
| AI Coach (Mistral AI) | ✅ 5 AI endpoints | ❌ |
| Gamification (XP, Badges, Levels) | ✅ Full system | ❌ |
| Screen Time Tracking (Extension) | ✅ Per-domain tracking | ❌ |
| Redis Token Blacklist | ✅ Secure logout | ❌ |
| Mood Analytics | ✅ Per-session mood | ❌ |
| Admin Panel with Audit Logs | ✅ Full audit trail | ❌ |

---

### ⚡ 30-Second Pitch

> "Frame-Out is a full-stack productivity platform for the dopamine-addicted generation. It's a MERN web app combined with a Chrome Extension that blocks distracting websites at the browser level. Users earn XP, level up, get AI-generated missions, and receive burnout detection powered by Mistral AI. It's not a to-do app. It's a productivity operating system."

---

### ⏱️ 1-Minute Pitch

> "We built Frame-Out because existing productivity tools are fragmented. You use one app for timers, another for blocking, another for analytics. We unified everything. Frame-Out gives you a Pomodoro/custom focus timer, a task manager with XP rewards and penalties, a GitHub-style activity heatmap, daily AI-generated missions, burnout detection, and a Chrome Extension that enforces focus by blocking social media at the network request level using Chrome's declarativeNetRequest API. The gamification layer turns productivity into a game — complete tasks, earn XP, level up, unlock badges. The AI layer, powered by Mistral, gives you personalized weekly reports, adaptive timer suggestions, and focus coaching. It's cross-platform, deployed on Vercel (frontend) and Railway (backend)."

---

### 🔬 3-Minute Technical Explanation

Frame-Out is a **full-stack MERN application** with:

1. **Frontend:** React 19 + Vite, Redux Toolkit for state management, TailwindCSS v4 for styling, Recharts for data visualization, GSAP for animations.

2. **Backend:** Express 5 (Node.js), MongoDB + Mongoose for data persistence, Redis (ioredis) for JWT token blacklisting, Passport.js for Google OAuth, Resend for email delivery, Mistral AI SDK for AI features.

3. **Chrome Extension:** Manifest V3 service worker (`background.js`), `declarativeNetRequest` for network-level blocking, content scripts for YouTube Shorts and Instagram Reels DOM manipulation, `chrome.alarms` API for periodic backend sync, `chrome.idle` API for screen time accuracy.

4. **Architecture:** 4-layer separation — Routes → Middleware → Controllers → Services. Frontend follows Feature-based folder structure (auth/user/admin). Redux manages all global state with dedicated slices per domain.

5. **Gamification Engine:** `userstats.model.js` has the full XP threshold table (100 levels), badge definitions (15 badges), and `addXP()` instance method that auto-levels up. `gamification.service.js` is a centralized class handling session rewards, task rewards, and penalties.

---

## 2. COMPLETE ARCHITECTURE

### 🏗️ Full System Architecture

```
Browser (User)
     │
     ├── React Frontend (Vite) ──── Redux Store (auth + user + admin slices)
     │        │
     │        └── axios (lib/api.js) ──── withCredentials: true + Bearer token
     │
     ├── Chrome Extension (MV3)
     │        │
     │        ├── background.js (Service Worker)
     │        │     ├── declarativeNetRequest → blocks distracting sites
     │        │     ├── chrome.tabs API → tracks active tab domain + duration
     │        │     ├── chrome.alarms → syncs to backend every 1 min
     │        │     └── chrome.idle → pauses tracking when user is idle 60s+
     │        ├── popup.js → toggle focus mode UI
     │        ├── options.js → custom blocklist management
     │        └── content scripts:
     │              ├── yt_shorts_blocker.js → DOM hides Shorts tab, redirects /shorts URL
     │              └── ig_reels_blocker.js → DOM hides Reels nav, redirects /reels URL
     │
Express Backend (Railway)
     │
     ├── app.js (Global Middlewares: helmet, cors, rateLimit, cookieParser, morgan, passport)
     │
     ├── Routes (/api/*)
     │     ├── auth.routes.js    → /api/auth/*
     │     ├── task.routes.js    → /api/tasks/*
     │     ├── focussession.routes.js → /api/focus/*
     │     ├── analytics.routes.js → /api/analytics/*
     │     ├── heatmap.routes.js → /api/heatmap/*
     │     ├── userstats.routes.js → /api/userstats/*
     │     ├── ai.routes.js      → /api/ai/*
     │     ├── journal.routes.js → /api/journal/*
     │     ├── mission.routes.js → /api/missions/*
     │     └── admin.routes.js   → /api/admin/*
     │
     ├── Middlewares
     │     ├── auth.middleware.js (authenticateUser + authorizeAdmin)
     │     ├── validation.middleware.js
     │     └── task.middleware.js
     │
     ├── Controllers (business logic entry point)
     │
     ├── Services
     │     ├── gamification.service.js (XP, badges, levels, streaks)
     │     ├── ai.service.js (Mistral AI — 6 functions)
     │     └── mail.service.js (Resend email)
     │
     ├── Models (MongoDB / Mongoose)
     │     ├── user.model.js
     │     ├── task.model.js
     │     ├── focussession.model.js
     │     ├── analytics.model.js
     │     ├── heatmap.model.js
     │     ├── userstats.model.js  ← Core gamification model
     │     ├── journal.model.js
     │     ├── mission.model.js
     │     └── audit.model.js
     │
     ├── config/
     │     ├── config.js (env validation + URL normalization)
     │     ├── db.js (MongoDB connection)
     │     └── cache.js (Redis/ioredis connection)
     │
     └── utils/
           ├── asyncHandler.js (try-catch wrapper for controllers)
           └── emailTemplates.js (HTML email templates)

MongoDB Atlas ←→ mongoose
Redis Cloud ←→ ioredis (JWT blacklist)
Mistral AI API ←→ @mistralai/mistralai SDK
Resend API ←→ resend SDK
```

---

## 3. FILE & FOLDER BREAKDOWN

### 🗂️ Complete Folder Tree

```
Frame-out BGI/
├── Backend/
│   ├── server.js                    ← Entry point (DNS + connectDB + app.listen)
│   └── src/
│       ├── app.js                   ← Express app setup (all middlewares + routes)
│       ├── config/
│       │   ├── config.js            ← Env validation + URL normalization + CORS origins
│       │   ├── db.js                ← MongoDB connection
│       │   └── cache.js             ← Redis (ioredis) connection
│       ├── controllers/             ← Business logic (11 files)
│       ├── middlewares/             ← 3 middleware files
│       ├── models/                  ← 10 Mongoose schemas
│       ├── routes/                  ← 10 Express routers
│       ├── services/                ← 3 service files (AI, Gamification, Mail)
│       ├── utils/                   ← asyncHandler + emailTemplates
│       └── validator/               ← express-validator schemas (3 files)
│
├── Frontend/
│   ├── index.html                   ← Vite entry HTML
│   ├── vite.config.js               ← Vite config
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                 ← React entry (Provider + RouterProvider)
│       ├── index.css                ← Global CSS (Cinematic Noir tokens)
│       ├── app/
│       │   ├── App.jsx              ← Root component
│       │   ├── app.routes.jsx       ← All routes (PrivateRoute, PublicOnlyRoute, AdminRoute)
│       │   └── app.store.js         ← Redux store (auth + user + admin)
│       ├── lib/
│       │   └── api.js               ← Axios base URL + localStorage token helpers
│       ├── components/
│       │   ├── FrameOutLogo.jsx
│       │   └── SplashScreen.jsx
│       └── features/
│           ├── auth/                ← Login, Register, Forgot/Reset password, Verify email
│           ├── user/                ← Dashboard, Focus, Tasks, Insights, AI Coach, etc.
│           └── admin/               ← AdminDashboard.jsx
│
└── Extension/
    ├── manifest.json                ← MV3 config (permissions, content scripts)
    ├── background.js                ← Service worker (blocking + screen time + sync)
    ├── popup.html / popup.js / popup.css  ← Extension popup UI
    ├── options.html / options.js / options.css ← Settings page
    ├── blocked.html / blocked.css / blocked.js ← Blocked site page
    └── content/
        ├── yt_shorts_blocker.js     ← YouTube Shorts DOM blocker
        └── ig_reels_blocker.js      ← Instagram Reels DOM blocker
```

---

### 📁 Key File Explanations

#### `server.js`
- **Kya karta hai:** App ka entry point. DNS servers set karta hai (Google 8.8.8.8), MongoDB connect karta hai, phir Express server start karta hai.
- **Special:** `dns.setDefaultResultOrder("ipv4first")` — Railway pe IPv6 DNS resolution issues fix karta hai.
- **Calls:** `connectDB()` → `app.listen(PORT)`

#### `src/app.js`
- **Kya karta hai:** Pure Express app setup. Saare global middlewares yahan register hote hain.
- **Middleware order (important!):** helmet → rateLimit → morgan → json/urlencoded → cookieParser → cors → passport → routes → 404 → global error handler
- **Rate Limit:** 100 requests per 15 minutes per IP on `/api/*`
- **CORS:** `isAllowedFrontendOrigin()` function se dynamic origin check (Vercel preview URLs support karta hai)

#### `src/config/config.js`
- **Kya karta hai:** Saare environment variables validate karta hai. Missing env pe server boot nahi hota (fail-fast pattern).
- **Smart URL normalization:** `normalizeUrl()` function — whether you pass `localhost:3000` or `https://example.com`, sab normalize ho jaata hai.
- **FRONTEND_ORIGINS array:** Both production URL + all local URLs allowed for CORS.

#### `src/config/cache.js`
- **Kya karta hai:** ioredis ka ek Redis client banata hai.
- **Use:** JWT token blacklisting (logout pe token Redis mein store hota hai `bl_<token>` key ke saath)

---

### 📁 Frontend Feature Structure

#### `features/auth/` — Authentication Feature
```
auth/
├── pages/
│   ├── LandingPage.jsx     ← Hero + Features + CTA (59KB — biggest file!)
│   ├── LoginPage.jsx       ← Email/Password + Google OAuth button
│   ├── RegisterPage.jsx    ← Registration form with validation
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── VerifyEmailPage.jsx ← Token from URL query param
│   ├── TeamPage.jsx        ← ADAPTrix team showcase
│   └── LegalPage.jsx       ← T&C / Privacy
├── service/
│   └── auth.service.js     ← Axios calls to /api/auth/* + localStorage token save
├── state/
│   └── auth.slice.js       ← Redux: { user, isAuthenticated, isLoading }
└── hook/ (empty — logic in pages directly)
```

#### `features/user/` — All User-facing App Features
```
user/
├── pages/
│   ├── DashboardPage.jsx   ← Overview stats + recent tasks + weekly chart
│   ├── TasksPage.jsx       ← CRUD tasks + status filter + search
│   ├── FocusPage.jsx       ← Pomodoro/custom timer + session controls + mood
│   ├── InsightsPage.jsx    ← Analytics charts (today/week/month) + heatmap
│   ├── ReflectPage.jsx     ← Journal + mood tracking
│   ├── AICoachPage.jsx     ← All 5 AI endpoints displayed
│   ├── LeaderboardPage.jsx ← XP rankings + badges
│   ├── ProfilePage.jsx     ← User profile
│   └── SettingsPage.jsx    ← Theme toggle + preferences
├── components/
│   ├── AppLayout.jsx       ← Sidebar + outlet wrapper
│   ├── Sidebar.jsx         ← Navigation (all protected routes)
│   ├── XPCelebration.jsx   ← GSAP-powered XP gain animation
│   ├── DailyMissions.jsx   ← AI missions UI with complete button
│   ├── BreathingWidget.jsx ← Animated breathing exercise
│   └── DeepWorkMode.jsx    ← Full-screen deep work overlay
├── service/
│   └── user.service.js     ← ALL API calls (tasks, focus, analytics, heatmap, ai, journal, missions)
├── state/
│   └── user.store.js       ← Redux: dashboard, tasks, focus, analytics, heatmap, userStats, ai, leaderboard
├── hook/
│   ├── useDashboard.js     ← Fetches all dashboard data
│   ├── useTasks.js         ← Task CRUD operations
│   ├── useFocus.js         ← Focus session start/end
│   ├── useAnalytics.js     ← Analytics fetch
│   ├── useHeatmap.js       ← Heatmap year data
│   ├── useUserStats.js     ← XP, badges, leaderboard
│   ├── useAIInsights.js    ← AI coach data
│   ├── useUserProfile.js   ← Profile data
│   └── useSoundAlerts.js   ← Web Audio API sound notifications
└── utils/
    └── (level progress normalization)
```

#### `features/admin/` — Admin Panel
```
admin/
├── pages/
│   └── AdminDashboard.jsx  ← Stats + user list + role management + audit logs + task assign
├── service/
│   └── admin.service.js    ← Admin API calls
└── state/
    └── admin.slice.js      ← Admin Redux state
```

#### `app/app.routes.jsx` — Route Guards

3 types of route guards:
- **`PrivateRoute`:** Checks `isAuthenticated` from Redux. Agar nahi → `/login` redirect.
- **`PublicOnlyRoute`:** Agar already logged in → `/dashboard` redirect (ya `/admin` agar admin).
- **`AdminRoute`:** Checks `user.role === 'admin'` OR `user.email === 'admin@admin.com'`. Agar nahi → `/dashboard`.

#### `app/app.store.js` — Redux Store
```js
// 3 reducers:
{ auth: authReducer, user: userReducer, admin: adminReducer }
```

#### `lib/api.js` — Axios Base Configuration
- **Dual token strategy:** Cookies (httpOnly) + localStorage fallback (`frame_out_token`)
- **`attachAuthToken()`:** Every request interceptor mein — localStorage se token uthao, `Authorization: Bearer <token>` header mein daalo.
- **Why localStorage fallback?** Cross-origin cookie restrictions ke liye (Vercel frontend + Railway backend = different domains)

---

## 4. AUTHENTICATION DEEP DIVE

### 🔐 Complete Auth Flow

#### Register Flow
```
RegisterPage.jsx
    ↓
auth.service.js → POST /api/auth/register
    ↓
auth.routes.js → validateRegisterUser middleware (express-validator)
    ↓
auth.controller.js → register()
    ↓
userModel.findOne({ email }) — check if exists
    ↓
userModel.create({ email, contact, password, fullname, verified: false })
    ↓ (pre-save hook in user.model.js)
bcrypt.hash(password, 10) — auto-hashed before DB save
    ↓
jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' }) — verification token
    ↓
sendEmail() → mail.service.js → Resend API → HTML email with verify link
    ↓
If email fails → userModel.findByIdAndDelete(user._id) — ROLLBACK!
    ↓
Response: 201 { message: "Check your email" }
```

**Judge ke liye:** "Humne email failure pe registration rollback implement kiya hai — atomicity ensure karta hai."

#### Login Flow
```
LoginPage.jsx
    ↓
auth.service.js → POST /api/auth/login
    ↓
auth.controller.js → login()
    ↓
userModel.findOne({ email }).select('+password') — password normally excluded
    ↓
user.comparePassword(password) → bcrypt.compare()
    ↓
if !user.verified → 403 "Please verify email"
    ↓
generateToken(user._id) → jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
    ↓
res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7d })
    ↓
Response: { token, user: { id, email, fullname, verified, level, rank, role } }
    ↓
auth.service.js → setAuthToken(token) → localStorage.setItem('frame_out_token', token)
    ↓
Redux: setCredentials({ user }) → isAuthenticated: true
    ↓
app.routes.jsx → Navigate to /dashboard
```

#### JWT + Cookie + localStorage Strategy (Important!)
```
Backend:         Sets httpOnly cookie "token"
auth.service.js: Also saves token to localStorage key "frame_out_token"
lib/api.js:      attachAuthToken() — reads localStorage, adds Authorization: Bearer header

Why dual strategy?
- Cookie: Automatic browser sending (same origin)
- localStorage: Cross-origin support (Vercel ↔ Railway = different domains)
- Backend auth.middleware.js: Checks BOTH — cookie first, then Authorization header
```

#### Logout + Redis Blacklist
```
logoutUser (auth.controller.js)
    ↓
Get token from cookie OR Authorization header
    ↓
jwt.verify(token) → get expiry time
    ↓
redis.set(`bl_${token}`, "blocked", "EX", remainingSeconds)
    ← Token blocked in Redis until natural expiry!
    ↓
res.clearCookie('token')
    ↓
Frontend: clearAuthToken() → localStorage.removeItem('frame_out_token')
    ↓
Redux: logout() → isAuthenticated: false
```

**Why Redis blacklist?** JWT is stateless by nature — once issued, can't be invalidated. Redis blacklist mein token store karke logout ke baad bhi token use nahi ho sakta.

#### auth.middleware.js — Token Verification
```js
// 3-step verification:
1. Token extract: cookie || Authorization header
2. Redis check: redis.get(`bl_${token}`) → if blocked → 401
3. JWT verify: jwt.verify(token, JWT_SECRET) → decoded.id
4. User fetch: userModel.findById(decoded.id).select('-password')
5. req.user = user → next()

// Redis failure is NON-BLOCKING:
// If Redis is down, auth still works (graceful degradation)
```

#### Google OAuth Flow
```
/api/auth/google → passport.authenticate('google', { scope: ['profile', 'email'] })
    ↓
Google OAuth Consent Screen
    ↓
/api/auth/google/callback → passport.authenticate('google', { session: false })
    ↓
googleCallback() in auth.controller.js
    ↓
Find user by email → if not found, CREATE with googleId + verified: true
    ↓
generateToken(user._id)
    ↓
res.cookie('token', ...)
    ↓
res.redirect(frontendUrl) ← Frontend auto-loads with cookie set
```

**Note:** Google OAuth users automatically verified (no email verification needed).

#### Forgot / Reset Password Flow
```
forgotPassword():
  → generateToken(userId, '1h')
  → user.resetPasswordToken = token
  → user.resetPasswordExpire = Date.now() + 3600000
  → sendEmail(resetUrl)

resetPassword():
  → jwt.verify(token)
  → findOne({ _id, resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } })
  → user.password = newPassword (bcrypt auto-hashes via pre-save)
  → clear resetPasswordToken + resetPasswordExpire
```

---

## 5. TECH STACK EXPLAINED

### 🔧 Backend Technologies

| Tech | Kyu Use Kiya | Alternative Rejected | Tradeoff |
|------|-------------|---------------------|----------|
| **Node.js + Express 5** | Fast, non-blocking I/O. Express 5 has native async error handling | Fastify (less ecosystem), NestJS (too heavy for hackathon) | Single-threaded — CPU-heavy tasks block |
| **MongoDB + Mongoose** | Flexible schema for evolving data (tasks, sessions with different fields). Schemaless = faster dev | PostgreSQL (strict schema, slower iteration), Firebase (vendor lock-in) | No joins — data duplication needed (level stored in both User + UserStats) |
| **JWT** | Stateless auth — no session store needed | Sessions (requires sticky sessions for scaling) | Can't invalidate before expiry without Redis |
| **Redis (ioredis)** | Fast in-memory store for JWT blacklist | DB-based blacklist (slow), no blacklist (security risk) | Another infra dependency |
| **Passport + Google OAuth** | Industry standard, easy Google integration | Manual OAuth (too complex) | Adds passport middleware overhead |
| **Mistral AI** | Good JSON output, mistral-medium-latest is capable | OpenAI GPT-4 (expensive), Google Gemini (tried, switched) | API rate limits, paid service |
| **Resend** | Modern email API, generous free tier | Nodemailer + SMTP (complex config), SendGrid (more complex) | Limited templates |
| **Helmet** | Auto-sets 15+ security HTTP headers | Manual headers (error-prone) | Slight overhead |
| **bcryptjs** | Industry standard password hashing (salt rounds: 10) | argon2 (faster, more modern but less familiar) | Slower than argon2 |

### 🎨 Frontend Technologies

| Tech | Kyu Use Kiya | File Where Used |
|------|-------------|-----------------|
| **React 19** | Latest, concurrent features | All .jsx files |
| **Vite** | Super fast HMR, fast build | vite.config.js |
| **Redux Toolkit** | Predictable state, DevTools | app.store.js, user.store.js, auth.slice.js |
| **React Router v7** | File-based routing, nested routes | app.routes.jsx |
| **Axios** | Interceptors support (auto-attach token) | lib/api.js, all service files |
| **TailwindCSS v4** | Utility-first, fast styling | index.css + all pages |
| **GSAP** | Premium animations (XP celebrations) | XPCelebration.jsx, SplashScreen.jsx |
| **Recharts** | Declarative charts | InsightsPage.jsx, DashboardPage.jsx |
| **React Hook Form + Zod** | Form handling + schema validation | LoginPage, RegisterPage, etc. |
| **Lucide React** | Consistent icon set | All pages/components |

### 🔌 Extension Technologies

| API | Kyu Use Kiya | Where |
|-----|-------------|-------|
| **Manifest V3** | Required by Chrome (MV2 deprecated Jan 2025) | manifest.json |
| **declarativeNetRequest** | Network-level blocking (faster than webRequest, MV3 compatible) | background.js → enableFocusMode() |
| **chrome.storage.local** | Persist focus state, custom blocklist across sessions | background.js, popup.js, options.js |
| **chrome.alarms** | 1-minute periodic backend sync (service workers can die) | background.js |
| **chrome.tabs + windows** | Track active tab domain for screen time | background.js |
| **chrome.idle** | Pause tracking when user idle 60+ seconds | background.js |
| **chrome.cookies** | Get JWT token for backend API calls | background.js → syncActivityToBackend() |
| **Content Scripts** | DOM manipulation on YouTube & Instagram | yt_shorts_blocker.js, ig_reels_blocker.js |

**Why Manifest V3?**
Chrome forcibly deprecated MV2 in Jan 2025. MV3 uses a service worker instead of persistent background page — more resource efficient. `declarativeNetRequest` is the MV3 way to do URL blocking (previously `webRequest` in MV2).

---

*→ Continue in PART 2: Feature Flows, Code Call Chains, API Breakdown, Database Models*
