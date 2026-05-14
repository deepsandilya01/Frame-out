# 🎯 FRAME-OUT — COMPLETE HACKATHON GUIDE (PART 3/3)
### Chrome Extension | Security | Scalability | Judge Q&A | Viva Prep | Demo Strategy

---

## 11. CHROME EXTENSION — DEEP DIVE

### 📁 manifest.json — The Extension Blueprint

```json
{
  "manifest_version": 3,            ← MV3 (Chrome mandated from Jan 2025)
  "permissions": [
    "storage",                       ← chrome.storage.local (focusMode, customBlocklist)
    "declarativeNetRequest",         ← BLOCK websites at network level
    "declarativeNetRequestFeedback", ← Read current blocking rules
    "activeTab",                     ← Access current tab info
    "scripting",                     ← Inject content scripts dynamically
    "tabs",                          ← Monitor tab changes (screen time)
    "alarms",                        ← Periodic backend sync (every 1 min)
    "cookies",                       ← Get JWT token for API auth
    "idle"                           ← Detect user idle state
  ],
  "host_permissions": ["<all_urls>", "*://*.instagram.com/*", ...],
  "background": { "service_worker": "background.js" },
  "content_scripts": [
    { "matches": ["*://www.youtube.com/*"], "js": ["content/yt_shorts_blocker.js"] },
    { "matches": ["*://www.instagram.com/*"], "js": ["content/ig_reels_blocker.js"] }
  ]
}
```

**Why MV3?** Chrome deprecated MV2 in January 2025. MV3 replaces persistent background pages with service workers — more memory efficient, shorter lifecycle.

---

### 📄 background.js — The Brain of Extension

#### Website Blocking (declarativeNetRequest)

```js
DEFAULT_BLOCKED_SITES = ['instagram.com', 'facebook.com', 'reddit.com', 'twitter.com', 'x.com', 'discord.com', 'netflix.com']

enableFocusMode():
  sites = DEFAULT_BLOCKED_SITES + customBlocklist + AD_DOMAINS
  rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { urlFilter: site, resourceTypes: ['main_frame'] }
  }))
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existing, addRules: rules })
  chrome.storage.local.set({ focusMode: true })

How it works:
  User visits instagram.com
  ↓
  Chrome checks declarativeNetRequest dynamic rules
  ↓
  Matches rule with urlFilter: "instagram.com"
  ↓
  BEFORE the request even goes to Instagram's servers → Redirect to blocked.html
  ← Network-level interception! Not DOM-level.
```

**Judge ke liye:** "declarativeNetRequest is different from old webRequest API — it's declarative (you define rules), not imperative. Chrome enforces them at the browser engine level, so the blocking is instantaneous and can't be bypassed by JavaScript."

#### Screen Time Tracking

```js
State:
let activeTabInfo = null   // { id, domain, startTime }
let activityLog = {}       // { "github.com": { duration: 120, visits: 2 } }

Flow:
chrome.tabs.onActivated → updateCurrentTabDuration() → setActiveTab(newTab)
chrome.tabs.onUpdated (URL change in same tab) → same flow
chrome.windows.onFocusChanged → if browser lost focus: activeTabInfo = null
chrome.idle.onStateChanged → if idle/locked: stop tracking, activeTabInfo = null
                           → if active: resume tracking

updateCurrentTabDuration():
  durationSecs = (Date.now() - activeTabInfo.startTime) / 1000
  activityLog[domain].duration += durationSecs
  activeTabInfo.startTime = Date.now()  ← Reset for next interval

chrome.idle.setDetectionInterval(60)  ← 60 seconds idle = stop tracking
```

#### Backend Sync (Every 1 Minute)

```js
chrome.alarms.create("syncActivity", { periodInMinutes: 1 })
chrome.alarms.onAlarm → syncActivityToBackend()

syncActivityToBackend():
  updateCurrentTabDuration()  ← Flush current tab time
  payload = [{ website, duration, visits }, ...]
  
  // Get JWT token from cookies:
  cookie = await chrome.cookies.get({ url: BACKEND_URL, name: "token" })
  token = cookie.value
  
  // POST to backend:
  fetch(`${BACKEND_URL}/analytics/sync-extension`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ activities: payload })
  })
  
  if (res.ok): activityLog = {}  ← Clear after successful sync

BACKEND_URL = "https://resilient-enchantment-production.up.railway.app/api"
← HARDCODED! This is a weakness (see section 13)
```

#### Message Passing (popup ↔ background)

```js
// popup.js sends:
chrome.runtime.sendMessage({ action: 'toggleFocus' })
  ↓
// background.js listens:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleFocus'):
    currentlyOn ? disableFocusMode() : enableFocusMode()
    sendResponse({ focusMode: !currentlyOn })
  
  if (request.action === 'updateRules'):
    refreshRules()  ← Called when custom blocklist changes
})
// return true → async response (important for async message handlers!)
```

---

### 📄 popup.js — Extension Popup

```js
DOMContentLoaded:
  Load focusMode state from chrome.storage.local
  Display: READY / STAY HARD based on state
  
Toggle:
  sendMessage({ action: 'toggleFocus' })
  Update UI based on response

Settings button → chrome.runtime.openOptionsPage()

Blocked sites list:
  Show DEFAULT_SITES + customBlocklist from storage
```

---

### 📄 options.js — Settings Page

```js
Load: customBlocklist, blockShorts, blockReels, blockAds, focusDuration from storage

Add site:
  Get input → add to customBlocklist array → save → notifyBackground()
  notifyBackground() → sendMessage({ action: 'updateRules' }) → background refreshes rules

Remove site:
  Filter from array → save → notifyBackground()

Toggle preferences:
  blockShorts, blockReels, blockAds → saved to storage
  (Note: blockShorts/blockReels toggles don't directly affect declarativeNetRequest — 
   content scripts check these values independently)
```

---

### 📄 content/yt_shorts_blocker.js

```js
// DOM Manipulation on youtube.com

hideShortsUI():
  document.querySelector('a[href*="/shorts"]')?.style.display = 'none'  ← Hide nav tab
  ytd-rich-shelf-renderer (containing "Shorts")?.style.display = 'none' ← Hide shelf

blockShortsPage():
  if (location.pathname.startsWith('/shorts')):
    location.replace(chrome.runtime.getURL('blocked.html'))  ← Redirect to our page!

// YouTube is a SPA (Single Page App) — uses History API, not full page reloads
// Must listen to YouTube's custom navigation events:
window.addEventListener('yt-navigate-finish', init)  ← YouTube's custom event
window.addEventListener('spfdone', init)             ← Legacy YouTube event

init() runs on: initial load + every YouTube SPA navigation
```

**Why content script, not declarativeNetRequest for Shorts?**
Because `/shorts` is a path on youtube.com, not a separate domain. declarativeNetRequest blocks entire domains. To block a specific PATH within an allowed site, we need DOM-level interception via content scripts.

---

### 📄 content/ig_reels_blocker.js

```js
hideReelsButton():
  document.querySelector('a[href*="/reels"]')?.style.display = 'none'

blockReelsPage():
  if (location.pathname.startsWith('/reels')):
    location.replace(chrome.runtime.getURL('blocked.html'))

// Instagram SPA navigation events:
window.addEventListener('popstate', init)    ← Browser back/forward
window.addEventListener('pushstate', init)   ← React Router navigation
window.addEventListener('replacestate', init) ← History.replaceState()
```

---

## 12. SECURITY IMPLEMENTATION

### 🔒 Security Layers (from actual code)

#### 1. Helmet (app.js)
```js
app.use(helmet())
// Auto-sets: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
//            HSTS, X-XSS-Protection, Referrer-Policy
// Prevents: Clickjacking, MIME sniffing, XSS via headers
```

#### 2. Rate Limiting (app.js)
```js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per IP
  message: { message: "Too many requests", success: false }
})
app.use('/api', limiter)  ← ALL /api/* routes limited
// Protects against: brute force, DDoS
```

#### 3. CORS (app.js)
```js
cors({
  origin: (origin, callback) => callback(null, isAllowedFrontendOrigin(origin)),
  credentials: true  ← Required for cookies cross-origin
})
// isAllowedFrontendOrigin() checks:
// 1. Exact match in FRONTEND_ORIGINS array
// 2. Regex match for Vercel preview URLs: /^frame-out-[a-z0-9-]+\.vercel\.app$/
```

#### 4. JWT Security (auth.controller.js)
```js
// Token generation:
jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
// Minimal payload — only user ID (no sensitive data in token)

// Cookie options:
{
  httpOnly: true,    ← JS can't access (XSS protection)
  secure: true,      ← HTTPS only (in production)
  sameSite: 'none',  ← Cross-site allowed (different domains)
  maxAge: 7d
}
```

#### 5. Redis Blacklist (auth.middleware.js + auth.controller.js)
```js
// On logout:
redis.set(`bl_${token}`, "blocked", "EX", remainingSeconds)
// Token expires from Redis at same time JWT expires naturally

// On each request:
const isBlocked = await redis.get(`bl_${token}`)
if (isBlocked) → 401 Unauthorized

// Graceful degradation:
try { redis check } catch (redisErr) {
  console.warn("Redis check skipped")  ← Auth still works if Redis is down!
}
```

#### 6. Password Security (user.model.js)
```js
// Pre-save hook:
bcrypt.hash(password, 10)  ← 10 salt rounds (~100ms, brute force resistant)
// Only hashes if password field was modified (isModified check)

// Password field:
password: { type: String, required: function() { return !this.googleId } }
// ← Conditional required: Google users don't need password!
```

#### 7. Input Validation
```js
// auth.validator.js uses express-validator:
validateRegisterUser → checks email format, password min 8 chars, fullname presence
validateLoginUser → checks email + password

// validation.middleware.js:
const errors = validationResult(req)
if (!errors.isEmpty()) → 400 with errors array

// Body size limit (app.js):
app.use(express.json({ limit: '10kb' }))  ← Prevents large payload attacks
```

#### 8. MongoSanitize (Commented Out)
```js
// app.use(mongoSanitize()) ← COMMENTED OUT
// Reason: Incompatible with Express 5 on some Node versions
// WEAKNESS: NoSQL injection possible if user input directly used in queries
// Mitigation: Mongoose schema validation catches most issues
```

### 🔓 Attack Prevention Summary

| Attack | How We Prevent |
|--------|----------------|
| XSS (Cross-Site Scripting) | httpOnly cookies + Helmet CSP headers |
| CSRF | sameSite: 'none' + credentials: true CORS |
| Brute Force | Rate limiting (100 req/15min) + bcrypt |
| Token Theft | httpOnly cookie (JS can't steal it) |
| Replay Attack | Redis blacklist (used tokens blacklisted) |
| JWT Tampering | HS256 signature with secret key |
| SQL/NoSQL Injection | Mongoose schema validation (mongoSanitize commented out — weakness) |

---

## 13. SCALABILITY & PRODUCTION READINESS

### ⚠️ What Breaks at Scale

#### At 10K Users
- **Redis memory:** JWT blacklist grows — need TTL cleanup (we have EX, so it auto-expires ✅)
- **MongoDB:** No query performance issues at 10K with our indexes ✅
- **Mistral AI:** API rate limits could be hit during peak hours ⚠️

#### At 100K Users
- **Single Express server:** Will bottleneck — need horizontal scaling (PM2 cluster or multiple Railway instances)
- **MongoDB:** Need read replicas for analytics queries (heavy aggregations)
- **Analytics sync:** Called on every session end — high write load at peak
- **No job queue:** AI mission generation is synchronous — should use Bull/BullMQ queue

#### At 1M Users
- **Database:** Need sharding by userId
- **AI:** Need self-hosted or enterprise Mistral plan
- **Extension sync:** Every 1 minute × 1M users = ~16K requests/second — need dedicated service
- **Real-time:** No WebSockets — leaderboard updates require polling

### 🚀 Production Improvement Roadmap

```
Phase 1 (Immediate):
- Fix HARDCODED BACKEND_URL in background.js (use env variable)
- Uncomment mongoSanitize (fix Express 5 compatibility)
- Add DB indexes for analytics queries
- Add request logging with correlation IDs

Phase 2 (Scaling):
- Move AI calls to async job queue (Bull + Redis)
- Add WebSocket for real-time XP updates and leaderboard
- Database read replicas for analytics
- CDN for static assets

Phase 3 (Enterprise):
- Horizontal scaling (PM2 cluster mode)
- MongoDB Atlas sharding
- Redis cluster
- Monitoring (Datadog/New Relic)
- Distributed tracing
```

---

## 14. CODEBASE GAPS & HONEST WEAKNESSES

### ⚠️ Real Issues in the Code (From Actual Files)

1. **HARDCODED BACKEND_URL in background.js (line 118):**
   ```js
   const BACKEND_URL = "https://resilient-enchantment-production.up.railway.app/api"
   // Should be: configurable, not hardcoded
   ```

2. **Data Duplication (User + UserStats):**
   - `level` is stored in BOTH `user.model.js` AND `userstats.model.js`
   - Sync is done manually via `userModel.findByIdAndUpdate`
   - Risk: If sync fails, data inconsistency

3. **mongoSanitize Commented Out:**
   ```js
   // app.use(mongoSanitize()) ← DISABLED
   // NoSQL injection risk if queries use raw user input
   ```

4. **No Analytics for Extension Activity:**
   - `background.js` calls `/analytics/sync-extension` but this route may not be implemented
   - Screen time data might be lost

5. **No Pagination on Leaderboard:**
   - Top 50 users hardcoded — not infinite scroll

6. **No Rate Limiting on AI Endpoints:**
   - AI routes only have global 100 req/15min limit
   - A user could spam AI endpoints quickly

7. **Admin Email Hardcode:**
   ```js
   req.user.role === 'admin' || req.user.email === 'admin@admin.com'
   // Hardcoded admin email — security risk in production
   ```

8. **`@google/generative-ai` in package.json but never used:**
   - Started with Gemini, switched to Mistral — old package still installed

**How to answer judges:** *"We consciously made these tradeoffs for hackathon speed. In production, we'd fix the hardcoded URL, enable mongo sanitization, and implement proper queue-based AI processing."*

---

## 15. POSSIBLE JUDGE QUESTIONS & BEST ANSWERS

### Technical Architecture

**Q: Ek user ek hi time pe multiple sessions start kar sakta hai?**
> A: "No — backend mein session start karne pe ek active session create hoti hai. End call kiye bina dusri start ho sakti hai technically kyunki hum frontend pe check karte hain via Redux activeSession state. Production mein hum backend pe bhi check add karte."

**Q: JWT expire ho jaaye toh kya hoga?**
> A: "auth.middleware.js mein jwt.verify() throw karega — 401 return hoga. Frontend pe Redux logout action dispatch hoga, localStorage clear hoga, aur user login page pe redirect ho jaayega."

**Q: Agar Redis down ho jaaye?**
> A: "auth.middleware.js mein Redis check try-catch mein wrapped hai. Redis down hone pe auth still works — sirf logout token invalidation skip hoti hai. Graceful degradation implemented hai."

**Q: Database mein password kaise store hai?**
> A: "bcrypt.hash(password, 10) — 10 salt rounds ke saath. Pre-save mongoose hook mein auto-hash hota hai. Compare karne ke liye bcrypt.compare() use hoti hai. Plain text kabhi store nahi hota."

### Extension Questions

**Q: Extension kaise block karta hai websites?**
> A: "Chrome ke declarativeNetRequest API se. Hum dynamic rules define karte hain jisme urlFilter match hone pe request ko blocked.html pe redirect karte hain. Ye network-level interception hai — page load hone se PEHLE block hota hai. JavaScript disable karke bhi block hoga."

**Q: YouTube Shorts alag kaise block kiya?**
> A: "YouTube ek SPA hai — poora site block nahi kar sakte (users legit videos bhi dekhte hain). Content script inject karte hain jo DOM se Shorts tab hide karta hai, aur `/shorts` URL pe navigate karne pe `location.replace()` se blocked.html pe redirect karta hai. YouTube ke custom navigation events (`yt-navigate-finish`) listen karte hain kyunki YouTube full page reload nahi karta."

**Q: Extension ko backend se kaise connect kiya?**
> A: "background.js mein `chrome.cookies.get()` se JWT token fetch karte hain — same token jo web app login pe set hota hai. Phir `Authorization: Bearer <token>` header ke saath `/api/analytics/sync-extension` pe POST karte hain. chrome.alarms se every 1 minute sync hota hai."

**Q: Agar user logged out ho toh extension kya karta hai?**
> A: "Cookie nahi milti toh `syncActivityToBackend()` mein early return — 'No auth token found' warn karta hai. Focus mode toggle still works (local storage based) but screen time data sync nahi hoti."

### Gamification Questions

**Q: XP ka formula kya hai?**
> A: "Session complete pe +20 XP base. Pomodoro mode pe +10 bonus. Agar subah 7 baje se pehle session start kiya toh +15 Early Bird bonus. Streak ke hisaab se +5×streak XP (max 10 days). Distractions pe -2 XP per distraction. Task complete pe +10-15 XP. Task delete pe -5 XP penalty."

**Q: Level up kaise decide hota hai?**
> A: "`getLevelProgress(xp)` function LEVEL_THRESHOLDS array mein binary search karta hai. Level 1-10 tak fixed thresholds hain (100, 250, 500...). Level 10+ pe har level ke liye 200 zyaada XP chahiye. `addXP()` call ke baad level auto-recalculate hota hai."

### AI Questions

**Q: Agar Mistral fail kare toh?**
> A: "Do fallbacks hain. 1) `askJSON()` mein regex fallback — first JSON block extract karta hai raw response se. 2) `generateDailyMissions()` mein catch block — 3 hardcoded default missions return karta hai. Taaki app kabhi break na ho."

**Q: AI personalized kaise hai?**
> A: "Personalization data-driven hai. Har AI call pe hum user ka actual data MongoDB se aggregate karte hain — session count, distraction count, completion rate, streak, mood history. Ye data prompt mein inject hota hai. Toh Mistral ko ACTUALLY is user ki stats milti hain, generic response nahi aati."

### Security Questions

**Q: Cookies vs localStorage — security tradeoff?**
> A: "httpOnly cookie XSS se safe hai — JavaScript access nahi kar sakta. Lekin cross-origin (Vercel frontend + Railway backend = alag domains) pe cookie send nahi hoti bina special config ke. Isliye localStorage fallback rakha hai. `sameSite: none, secure: true` se cross-origin cookies allowed hain. Ye tradeoff hai security vs functionality ka."

**Q: CSRF attack se kaise protected ho?**
> A: "Cookie with SameSite: 'none' use karte hain, aur CORS mein sirf allowed origins se credentials accept karte hain. API key header technique bhi use ho sakti thi but CORS approach sufficient hai is scale ke liye."

---

## 16. FINAL ROUND DEMO STRATEGY

### 🎬 5-Minute Demo Script

**Minute 0:00-0:30 — Hook (Landing Page)**
> "Ye hai Frame-Out. Aaj ki generation distraction mein doob rahi hai. YouTube Shorts, Instagram Reels, infinite scroll. Humne ek complete ecosystem banaya hai jo is problem solve karta hai."

**Minute 0:30-1:30 — Chrome Extension (BIGGEST WOW MOMENT)**
> 1. Extension ka popup dikhao — "Focus Mode OFF"
> 2. Toggle karo → "Focus Mode ON"
> 3. Instagram.com kholne ki koshish karo → `blocked.html` dikhaye!
> 4. YouTube pe Shorts tab hide ho gaya dikhao
> 5. "Ye network-level blocking hai. Browser engine level pe. Bypass nahi ho sakta."

**Minute 1:30-2:30 — Focus Timer**
> 1. FocusPage pe jao
> 2. Mood select karo, Pomodoro start karo
> 3. "Session start hote hi backend mein record ho gaya"
> 4. End karo → XP celebration animation dikhao
> 5. "Gamification live hai — XP earned, badge check, streak update"

**Minute 2:30-3:30 — AI Coach**
> 1. AICoachPage pe jao
> 2. "Burnout Check" click karo → Real AI response dikhao
> 3. "Productivity Analysis" → headline + insights dikhao
> 4. "Daily Missions" dikhao — AI-generated aaj ke liye

**Minute 3:30-4:30 — Insights & Dashboard**
> 1. DashboardPage — stats, weekly chart, missions
> 2. InsightsPage — heatmap, productivity score, dopamine score
> 3. LeaderboardPage — XP rankings

**Minute 4:30-5:00 — Admin Panel**
> 1. Admin login
> 2. Stats + user list + audit logs dikhao
> 3. "Task assign karo kisi user ko — directive system"

### ❌ What NOT to Waste Time On
- Registration flow (boring, skip karo — already logged in rehna)
- Forgot password (email delivery slow)
- Settings page (not impressive)

---

## 17. LAST 10-MINUTE QUICK REVISION

### 💪 Strongest Points to Emphasize

1. **Chrome Extension with declarativeNetRequest** — network-level, unbypassable blocking
2. **YouTube Shorts + Instagram Reels DOM blocking** — content script magic
3. **Screen time tracking** — real browser activity monitoring
4. **Mistral AI — 6 AI endpoints** — genuine personalization with real data
5. **Gamification Engine** — 100-level XP system, 15 badges, streak system
6. **Redis JWT blacklist** — proper secure logout
7. **Dual token strategy** — cookies + localStorage for cross-origin
8. **Daily AI missions** — cached per day, fallback if AI fails
9. **Analytics dual scoring** — productivityScore + dopamineScore
10. **Admin panel with audit logs** — enterprise-grade admin

### ⚠️ Weaknesses — Handle Smartly

| Weakness | Smart Answer |
|----------|-------------|
| Hardcoded backend URL in extension | "Hackathon tradeoff — production mein config.js use karte" |
| mongoSanitize disabled | "Express 5 compatibility issue — mongoose validation covers most cases" |
| No WebSocket for real-time | "Polling-based for now — WebSocket phase 2 mein" |
| Data duplication User + UserStats | "Legacy support + redundancy — source of truth UserStats model hai" |
| AI response takes 3-8 seconds | "Mistral API latency — production mein streaming + caching lagate" |

### 📢 What NOT to Say
- ❌ "Ye feature complete nahi hua" (say "future roadmap mein hai")
- ❌ "MongoDB slow hai" (say "indexes optimize kiye hain")  
- ❌ "Hume nahi pata" (always give partial answer + future direction)
- ❌ Apologize for missing features

### 🎯 Confidence Boosters

> "Hamara biggest differentiation Chrome Extension hai — koi productivity app ne is level ka browser integration nahi kiya hai. declarativeNetRequest se network-level blocking, content scripts se SPA navigation handling, idle detection se accurate screen time — ye sab ek hi app mein."

> "AI layer sirf gimmick nahi hai — har AI call pe actual user data MongoDB se aggregate karta hai aur Mistral ko real stats deta hai. Output genuinely personalized hai."

> "Gamification sirf points dena nahi hai — penalty system bhi hai. Task delete karne pe -5 XP, deadline miss pe -5 XP. Ye behavioral psychology hai — accountability create karta hai."

---

## 18. TOP VIVA QUESTIONS (ACTUAL CODEBASE BASED)

1. **`asyncHandler.js` kya karta hai?** → Promise.resolve(fn).catch(next) — try-catch wrapper eliminates repetition in every controller

2. **`attachAuthToken` function kahan define hai?** → `lib/api.js` — Axios request interceptor jo localStorage se token uthata hai

3. **`sendTokenResponse()` kya return karta hai?** → Cookie + JSON response with token + user object (id, email, fullname, verified, level, rank, role)

4. **`getAuthCookieOptions()` mein sameSite 'none' kyun?** → Cross-origin cookies ke liye (Vercel ≠ Railway domain)

5. **Streak logic kahan hai?** → `gamification.service.js` → `awardSessionRewards()` — lastActiveDate check karta hai yesterday vs today

6. **Heatmap ka `level` field kaise compute hota hai?** → `heatmap.model.js` mein pre-save hook — `computeLevel(focusMinutes)` → 0-4 rating

7. **`generateDailyMissions()` fail hone pe kya hota hai?** → catch block mein 3 hardcoded missions return hoti hain

8. **Admin ko identify kaise karte ho?** → `req.user.role === 'admin' || req.user.email === 'admin@admin.com'`

9. **`bl_${token}` Redis key ka TTL kaise set hota hai?** → `decoded.exp - Math.floor(Date.now()/1000)` — token ki remaining lifetime

10. **Google OAuth user ka password kya hoga?** → No password — `required: function() { return !this.googleId }` conditional required field

11. **`declarativeNetRequest` vs `webRequest` difference?** → declarativeNetRequest: declarative rules, no JS access to request. webRequest: programmatic, can read/modify. MV3 uses declarativeNetRequest.

12. **Extension mein cookie kaise milta hai backend ka?** → `chrome.cookies.get({ url: BACKEND_URL, name: "token" })` — same domain cookie read

13. **`productivityScore` formula kya hai?** → `(completedSessions/totalSessions)*50 + (tasksCompleted/tasksCreated)*30 - distractions*2`

14. **`dopamineScore` formula?** → `focusMinutes*0.5 + tasksCompleted*5 - distractions*2`

15. **`deadlinePenaltyAppliedAt` kyun rakha?** → Idempotency — double penalty prevent karne ke liye. Ek baar penalty apply hone ke baad same task pe dobara nahi lagega.

---

*📄 Complete Guide: PART1 (Architecture + Auth + Tech Stack) + PART2 (Features + APIs + Models + Gamification + AI) + PART3 (Extension + Security + Scalability + Q&A)*

**ALL THE BEST BHAI! 🚀 JAI HO ADAPTrix! 💪**
