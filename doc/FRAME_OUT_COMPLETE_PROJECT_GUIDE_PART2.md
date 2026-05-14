# 🎯 FRAME-OUT — COMPLETE HACKATHON GUIDE (PART 2/3)
### Feature Flows | API Breakdown | Database Models | Gamification | AI Layer

---

## 6. COMPLETE FEATURE FLOWS (ACTUAL CODE)

### 🔵 Task Create/Complete/Delete Flow

#### Create Task
```
TasksPage.jsx → form submit
    ↓
useTasks.js → userService.createTask({ title, description, priority, deadline, tags })
    ↓
user.service.js → POST /api/tasks/create
    ↓
task.routes.js → authenticateUser → createTask controller
    ↓
task.controller.js → taskModel.create({ user: req.user._id, title, ... })
    ↓
Response → Redux: addTask(task) → tasks.list.unshift(task)
    ↓
UI re-renders with new task at top
```

#### Complete Task (XP Award / Penalty Logic)
```
TasksPage.jsx → Mark Complete button
    ↓
userService.patchStatus(id, "completed") → PATCH /api/tasks/:id/status
    ↓
task.controller.js → updateTaskStatus()
    ↓
Check: isPastDeadline(task.deadline)?
    ├── YES (overdue) → gamificationService.applyTaskPenalty(userId, task.penalty, "DEADLINE_MISSED")
    │     → UserStats.addXP(-5) → XP floor at 0 → save → sync level to User model
    │     → Response: { gamification: { xpLost: 5, reason: "Missed task deadline" } }
    │
    └── NO (on time) → gamificationService.awardTaskRewards(userId, task.xpReward)
          → UserStats.addXP(+15) → check level up → check TASKS_10/TASKS_50 badges
          → Response: { gamification: { xpGained: 15, leveledUp: bool, newBadges: [] } }
    ↓
Frontend: XPCelebration.jsx animates if xpGained or leveledUp
```

#### Delete Task (Penalty!)
```
deleteTask controller:
  task = findOneAndDelete({ _id, user })
  if task.status !== "completed":
    gamificationService.applyTaskPenalty(userId, task.penalty || 5, "TASK_DELETED")
    → XP deducted! -5 XP penalty for abandoning task
```

---

### 🔴 Focus Session Flow (Core Feature)

#### Start Session
```
FocusPage.jsx → Start button
    ↓
useFocus.js → userService.startFocus({ timerType, focusDuration, breakDuration, mode, mood })
    ↓
POST /api/focus/start → focussession.controller.js → startSession()
    ↓
timerType === "pomodoro" ? focusDuration = 25, breakDuration = 5 : use custom values
    ↓
focusSessionModel.create({ user, timerType, focusDuration, breakDuration, mode, mood, startedAt: new Date() })
    ↓
Response: { session, timer: { focusMinutes, breakMinutes } }
    ↓
Redux: setActiveSession(session) → Timer UI starts countdown
```

#### End Session (Complex — Gamification + Analytics Sync)
```
FocusPage.jsx → End / Timer complete
    ↓
userService.endFocus({ sessionId, distractions, notes, mood, completed: true })
    ↓
POST /api/focus/end → focussession.controller.js → endSession()
    ↓
actualMinutes = Math.min( (endedAt - startedAt) / 60000, focusDuration )
session.endedAt = endedAt; session.duration = actualMinutes; session.completed = true
    ↓
if completed:
  gamificationService.awardSessionRewards(userId, { actualMinutes, distractions, timerType, startHour })
    ↓ (inside gamification.service.js)
    ├── addXP(+20, "SESSION_COMPLETED")
    ├── if timerType === "pomodoro": addXP(+10, "SESSION_POMODORO")
    ├── if startHour < 7: addXP(+15, "EARLY_BIRD_BONUS") + awardBadge("EARLY_BIRD")
    ├── if distractions > 0: addXP(-2 × distractions, "DISTRACTION_PENALTY")
    ├── if distractions === 0: awardBadge("NO_DISTRACTION")
    ├── Streak logic: check lastActiveDate vs today vs yesterday
    ├── addXP(STREAK_BONUS × min(streak, 10), "STREAK_BONUS")
    ├── Milestone badge checks: FIRST_SESSION, STREAK_3/7/30, FOCUS_100, LEVEL_5/10/25/50/100
    ├── stats.save() → UserStats updated
    └── userModel.findByIdAndUpdate → sync totalFocusTime, totalSessions, streak, level
    ↓
Response: { gamification: { xpEarned, xp, level, streak, newBadges, leveledUp } }
    ↓
Frontend: XPCelebration.jsx animates level up
```

---

### 🤖 AI Feature Flows

#### Missions Generation (Daily AI-Powered)
```
GET /api/missions/today → mission.controller.js → getTodayMissions()
    ↓
MissionModel.findOne({ user, date: today })
    ├── Found → return cached missions (fresh: false)
    └── Not found → Generate new:
          ├── Aggregate last 7 days focus sessions (MongoDB $group)
          ├── Count pending tasks
          ├── Get UserStats (streak, level, xp)
          ↓
        generateDailyMissions() → ai.service.js
          ↓
        Mistral API call (mistral-medium-latest, temp: 0.85)
          ↓
        Returns JSON array: 3 missions [easy, medium, hard]
          ↓
        MissionModel.create({ user, date, missions })
          ↓
        Response: { missions, fresh: true }
```

#### Productivity Analysis Flow
```
AICoachPage.jsx → "Analyze" button
    ↓
userService.getProductivityAnalysis() → POST /api/ai/productivity-analysis
    ↓
ai.controller.js → productivityAnalysis()
    ↓
Aggregate last 7 days focus sessions (MongoDB $group)
Aggregate last 7 days tasks
Get UserStats (currentStreak, level)
Calculate: productivityScore = sessionRate(50%) + taskRate(30%) - distractionPenalty(20%)
    ↓
analyzeProductivity(stats) → ai.service.js → askJSON(prompt)
    ↓
Mistral API → JSON: { headline, score_interpretation, strengths[], areas_to_improve[], distraction_insight, streak_message, tomorrow_goal }
    ↓
Response → Redux: setAIAnalysis(result) → AICoachPage displays cards
```

#### Burnout Detection
```
GET /api/ai/burnout-check → ai.controller.js → burnoutCheck()
    ↓
Aggregate last 7 days sessions: sessions count, completion rate, avg distractions, avg session length
Get last 5 moods from focus sessions
    ↓
detectBurnout({ avgDistractions7d, sessionsLast7d, completionRate7d, streak, avgSessionLength, moodTrend })
    ↓
Mistral: { risk_level: "none|low|medium|high", risk_score: 0-100, status, headline, signals[], recommendations[], recovery_plan, encouragement }
```

#### Adaptive Timer
```
GET /api/ai/adaptive-timer → ai.controller.js → adaptiveTimer()
    ↓
Aggregate last 14 days sessions: avgSessionLength, completionRate, avgDistractions, preferredMode
    ↓
getAdaptiveTimer() → Mistral
    ↓
{ suggested_minutes: 15-90, suggested_break: 3-20, confidence, reasoning, mode, tip }
    ↓
FocusPage shows AI-suggested timer duration
```

---

### 📊 Analytics Engine

#### Analytics Sync (POST /api/analytics/sync)
```
Called after: endSession OR task completion
    ↓
analytics.controller.js → syncTodayAnalytics()
    ↓
toMidnightUTC() — normalize to midnight UTC for daily grouping
    ↓
PARALLEL:
├── focusSessionModel.aggregate([
│     $match: { user, startedAt: today },
│     $group: { totalFocusMinutes, totalSessions, completedSessions, distractionsCount }
│   ])
└── taskModel.aggregate([
      $match: { user, createdAt: today },
      $group: { tasksCreated, tasksCompleted }
    ])
    ↓
productivityScore = (completedSessions/totalSessions)*50 + (tasksCompleted/tasksCreated)*30 - distractions*2
dopamineScore = focusMinutes*0.5 + tasksCompleted*5 - distractions*2
    ↓
AnalyticsModel.findOneAndUpdate(
  { user, date: today },
  { $set: data },
  { upsert: true, new: true }
)
← One document per user per day (upsert pattern)
```

#### Weekly Analytics
```
GET /api/analytics/week
    ↓
AnalyticsModel.find({ user, date: { $gte: 7_days_ago } }).sort({ date: 1 })
    ↓
Returns: { snapshots: [...7 days], totals: { totalFocusMinutes, totalSessions, tasksCompleted, distractionsCount } }
    ↓
InsightsPage → Recharts BarChart renders weekly focus bars
```

---

### 🔥 Heatmap System

**GitHub-style activity heatmap — one document per user per day.**

```
heatmap.model.js:
- date: String "YYYY-MM-DD"
- focusMinutes, sessionsCompleted, tasksCompleted, distractions
- level: 0-4 (auto-computed in pre-save hook)
  - 0: inactive, 1: 1-30min, 2: 31-60min, 3: 61-120min, 4: 121+min

heatmap.controller.js → syncHeatmap():
  Same upsert pattern as analytics
  → year heatmap: find last 365 days → InsightsPage renders grid

Admin weekly report uses heatmap data for day-by-day breakdown
```

---

### 📔 Journal (Reflect Page)

```
ReflectPage.jsx → Save journal entry
    ↓
userService.saveJournalToday({ content, mood, goals[], gratitude[], highlights })
    ↓
PUT /api/journal/today → journal.controller.js
    ↓
JournalModel.findOneAndUpdate(
  { user, date: today_YYYY-MM-DD },
  { $set: data },
  { upsert: true, new: true }
)
← One entry per user per day

Fields: content (5000 char), mood (5 options), goals[], gratitude[], highlights
```

---

### 👑 Admin Panel

```
AdminDashboard.jsx → admin.service.js → /api/admin/*
    ↓
admin.routes.js → authenticateUser + authorizeAdmin (checks role === 'admin' OR email === 'admin@admin.com')
    ↓
admin.controller.js:

1. getPlatformStats() → GET /api/admin/stats
   → userCount, sessionCount, taskCount, totalFocusMinutes
   → growthData: users grouped by createdAt date (chart data)
   → recentUsers: last 5 signups

2. getAllUsers() → GET /api/admin/users
   → All users without passwords

3. updateUserRole() → PATCH /api/admin/users/:id/role
   → Changes user role
   → auditModel.create({ action: "Access Level Modified", ... })

4. deleteUser() → DELETE /api/admin/users/:id
   → Deletes user + all their sessions + tasks (cascade)
   → auditModel.create({ action: "Node Terminated", ... })

5. assignTask() → POST /api/admin/tasks/assign
   → Creates task for any user with xpReward: 20
   → auditModel.create({ action: "Directive Assigned", ... })

6. getAuditLogs() → GET /api/admin/logs
   → Last 50 audit entries with admin info populated
```

---

## 7. COMPLETE API BREAKDOWN

### Auth APIs (`/api/auth/*`)

| Method | Route | Auth | Description | Controller |
|--------|-------|------|-------------|------------|
| POST | `/register` | Public | Register + send verification email | `register()` |
| POST | `/login` | Public | Login + set cookie + return token | `login()` |
| GET | `/verify-email?token=` | Public | Verify email from link | `verifyEmail()` |
| POST | `/resend-verification` | Public | Resend verification email | `resendVerification()` |
| POST | `/forgot-password` | Public | Send reset link | `forgotPassword()` |
| POST | `/reset-password` | Public | Reset with token | `resetPassword()` |
| GET | `/google` | Public | Redirect to Google OAuth | passport |
| GET | `/google/callback` | Public | Handle OAuth callback | `googleCallback()` |
| GET | `/get-me` | Private | Get current user | `getMe()` |
| GET | `/logout` | Private | Logout + Redis blacklist | `logoutUser()` |

### Task APIs (`/api/tasks/*`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/view` | Private | Get tasks (filter: status, priority, search) |
| POST | `/create` | Private | Create task |
| GET | `/:id` | Private | Get task by ID |
| PATCH | `/:id/status` | Private | Update status + XP reward/penalty |
| PUT | `/update/:id` | Private | Update task details |
| DELETE | `/delete/:id` | Private | Delete + apply penalty |
| PATCH | `/:id/miss-deadline` | Private | Apply deadline penalty explicitly |

### Focus Session APIs (`/api/focus/*`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/start` | Start session (pomodoro or custom) |
| POST | `/end` | End session + award XP + badges |
| GET | `/histories` | Paginated session history |
| GET | `/stats` | Lifetime stats from User model |
| GET | `/today` | Today's sessions + totalMinutes |
| GET | `/week` | This week's sessions |
| GET | `/month` | This month's sessions |
| GET | `/calendar` | Calendar view (date → minutes map) |
| GET | `/mood-analytics` | Mood distribution + trend (30 days) |

### AI APIs (`/api/ai/*`)

| Method | Route | Description | Mistral Function |
|--------|-------|-------------|-----------------|
| POST | `/productivity-analysis` | 7-day analysis | `analyzeProductivity()` |
| POST | `/focus-suggestions` | Focus coaching | `getFocusSuggestions()` |
| POST | `/weekly-report` | Narrative weekly report | `generateWeeklyReport()` |
| GET | `/adaptive-timer` | Optimal timer suggestion | `getAdaptiveTimer()` |
| GET | `/burnout-check` | Burnout detection | `detectBurnout()` |

### Analytics APIs (`/api/analytics/*`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/sync` | Rebuild today's snapshot from raw data |
| GET | `/today` | Today's snapshot |
| GET | `/week` | Last 7 days snapshots + totals |
| GET | `/month` | Current month snapshots + totals |
| GET | `/overview` | All-time stats from User model |

### UserStats APIs (`/api/userstats/*`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/me` | Full UserStats (XP, level, badges, streaks) |
| GET | `/badges` | Badges only |
| GET | `/xp-log` | Last 100 XP transactions |
| GET | `/leaderboard` | Top users by XP |
| GET | `/level-map` | Level thresholds array |

---

## 8. DATABASE & MODELS

### 📄 user.model.js — Core User

```js
Fields:
- email (unique, required)
- contact (optional)
- password (required unless googleId present — conditional required)
- fullname (required)
- role: "user" | "admin" (default: "user")
- googleId (for OAuth users)
- verified: Boolean (default: false)
- streak, level, rank (gamification sync fields)
- totalFocusTime, totalSessions, totalDistractions (legacy counters)
- longestStreak, lastStreakReset
- resetPasswordToken, resetPasswordExpire (for password reset)

Pre-save hook: bcrypt.hash(password, 10) — only if password modified
Instance method: comparePassword(password) → bcrypt.compare()

NOTE: Gamification data is duplicated between User + UserStats models
      (legacy support — UserStats is the source of truth)
```

### 📄 userstats.model.js — Gamification Source of Truth

```js
Exported constants:
- LEVEL_THRESHOLDS: Array of 100 XP thresholds
  [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, ...]
  After level 10: each level needs 200 more XP than previous gap
  
- XP_REWARDS: { SESSION_COMPLETED: 20, SESSION_POMODORO: 10, TASK_COMPLETED: 15,
                STREAK_BONUS: 5, PERFECT_DAY: 50, DISTRACTION_PENALTY: -2 }

- BADGE_DEFINITIONS: 15 badges:
  FIRST_SESSION, STREAK_3, STREAK_7, STREAK_30, FOCUS_100,
  TASKS_10, TASKS_50, PERFECT_DAY, LEVEL_5, LEVEL_10, LEVEL_25, LEVEL_50, LEVEL_100,
  NO_DISTRACTION, EARLY_BIRD

Schema fields:
- user (ref: User, unique index — one stats per user)
- xp (min: 0), level, xpToNextLevel
- currentStreak, longestStreak, lastActiveDate ("YYYY-MM-DD")
- totalSessionsCompleted, totalTasksCompleted, totalFocusMinutes, totalDistractions, perfectDays
- badges: [{ id, name, desc, icon, earnedAt }]
- xpLog: [{ amount, reason, earnedAt }] — last 100 entries (audit trail)

Instance methods:
- addXP(amount, reason):
    xp = Math.max(0, xp + amount)  ← Floor at 0
    Push to xpLog (trim to 100)
    Recalculate level via getLevelProgress(xp)
    Returns: true if level increased (leveled up!)

- awardBadge(badgeId):
    Check if already earned → no-op
    Push badge with earnedAt
    Returns: true if newly awarded

- syncLevelProgress():
    Recalculate and sync level + xpToNextLevel
```

### 📄 task.model.js

```js
Fields:
- user (ref: User)
- title (required, trimmed)
- description, priority: low|medium|high
- status: pending|in-progress|completed
- deadline (Date)
- completedAt (Date — set when status → completed)
- xpReward (default: 10) ← Variable per task!
- penalty (default: 5) ← Applied on delete or deadline miss
- deadlinePenaltyAppliedAt (prevents double penalty)
- tags: [String]

Indexes: { user, createdAt } + { user, status }
```

### 📄 focussession.model.js

```js
Fields:
- user (ref: User)
- timerType: "pomodoro" | "custom"
- focusDuration (planned minutes), breakDuration
- duration (actual minutes — filled on /end)
- pomodoroRound (1, 2, 3...)
- mode: "pomodoro" | "deep-work"
- mood: happy|tired|stressed|motivated|calm
- distractions (count logged during session)
- completed (Boolean — false until /end called)
- notes, startedAt, endedAt

Index: { user, startedAt } — for fast date range queries
```

### 📄 analytics.model.js — Daily Snapshot

```js
One document per user per day (compound unique index: { user, date })
Fields:
- date (midnight UTC) — for easy day grouping
- totalFocusMinutes, totalSessions, completedSessions
- tasksCreated, tasksCompleted
- distractionsCount
- productivityScore (0-100):
    formula = (completedSessions/totalSessions)*50 + (tasksCompleted/tasksCreated)*30 - distractions*2
- dopamineScore:
    formula = focusMinutes*0.5 + tasksCompleted*5 - distractions*2
- streakOnDay

Updated via POST /api/analytics/sync — called after every session end or task complete
```

### 📄 heatmap.model.js — Activity Heatmap

```js
One document per user per day (unique index: { user, date })
Fields:
- date: String "YYYY-MM-DD"
- focusMinutes, sessionsCompleted, tasksCompleted, distractions
- wasActive: Boolean
- level: 0-4 (auto-computed via pre-save + pre-findOneAndUpdate hooks)
  - 0: 0 min, 1: 1-30 min, 2: 31-60 min, 3: 61-120 min, 4: 121+ min

InsightsPage renders last 365 days as color-coded grid
```

### 📄 mission.model.js

```js
One document per user per day (unique: { user, date })
missions array (subdocuments):
- title, description, xpReward
- difficulty: easy|medium|hard
- category: focus|tasks|wellness|streak|reflection
- completed: Boolean, completedAt: Date

Generated fresh daily via Mistral AI
Cached — same missions all day until midnight
```

### 📄 journal.model.js

```js
One entry per user per day (unique: { user, date })
Fields:
- date: "YYYY-MM-DD"
- content (max 5000 chars)
- mood: sleepy|calm|happy|motivated|energized
- goals: [String] (max 200 chars each)
- gratitude: [String]
- highlights (max 1000 chars)
```

### 📄 audit.model.js — Admin Action Log

```js
Fields:
- action: String (e.g., "Access Level Modified", "Node Terminated", "Directive Assigned")
- details: String
- admin (ref: User — who did the action)
- target: String (user name or task title)
- type: user_management|task_assignment|system|security
```

---

## 9. GAMIFICATION SYSTEM — DEEP DIVE

### 🎮 How the XP System Works

```
Level Thresholds (from userstats.model.js):
Level 1  → 0 XP
Level 2  → 100 XP needed
Level 3  → 250 XP
Level 4  → 500 XP
Level 5  → 900 XP
Level 6  → 1400 XP
...
Level 10 → 5000 XP
Level 11+ → Each level needs 200 more XP gap than previous

XP Sources:
+20 XP → Complete a focus session
+10 XP → Bonus for Pomodoro mode
+15 XP → Early Bird (session started before 7AM!)
+5×N  XP → Streak bonus (N = current streak, max 10 days)
+50 XP → Perfect Day (4+ sessions + 3+ tasks)
+15 XP → Complete a task (on time)
+10-75 XP → Complete daily missions (easy/medium/hard)

XP Losses:
-2×N XP → N distractions logged in a session
-5 XP  → Task deleted before completion
-5 XP  → Task completed after deadline
```

### 🏆 Badge System (15 Badges)

```
Achievement Badges:
🎯 First Focus    → First session completed
✅ Task Crusher   → 10 tasks completed
🚀 Productivity Beast → 50 tasks completed
💯 Century Focus  → 100 hours of focus time (6000 minutes)
⭐ Perfect Day    → 4+ sessions AND 3+ tasks in one day
🧘 Deep Focus     → Session with 0 distractions
🌅 Early Bird     → Session started before 7AM

Streak Badges:
🔥 On Fire        → 3-day streak
⚡ Week Warrior   → 7-day streak
🏆 Iron Discipline → 30-day streak

Level Badges:
🌟 Rising Star    → Level 5
👑 Master Mind    → Level 10
💎 Grand Master   → Level 25
🐉 Legend         → Level 50
🌌 God Mode       → Level 100

All badges: no duplicates (awardBadge checks existing first)
All badges: stored with earnedAt timestamp
```

### 🏅 Leaderboard

```
/api/userstats/leaderboard → userstats.controller.js
    ↓
UserStatsModel.find({}).sort({ xp: -1 }).limit(50).populate('user', 'fullname email level')
    ↓
Returns ranked list with XP + level
    ↓
LeaderboardPage.jsx renders with rank numbers + user info
```

---

## 10. AI LAYER — COMPLETE IMPLEMENTATION

### 🤖 ai.service.js — Core Architecture

```
Mistral AI Client:
const client = new Mistral({ apiKey: config.MISTRAL_API_KEY })
const MODEL = "mistral-medium-latest"

askJSON(userPrompt) helper:
1. System message: "Always respond with valid raw JSON only"
2. User prompt with actual stats embedded
3. Temperature: 0.7 (controlled creativity)
4. maxTokens: 1024
5. Strip markdown fences (```json```) from response
6. Replace raw newlines/tabs (prevent JSON parse errors)
7. JSON.parse(raw)
8. Fallback: regex extract first {...} block
9. If all fails: throw Error with raw response preview
```

### 🔢 6 AI Functions

| Function | Input | Output Fields |
|----------|-------|---------------|
| `analyzeProductivity()` | 7-day focus/task/distraction stats | headline, score_interpretation, strengths[], areas_to_improve[], distraction_insight, streak_message, tomorrow_goal |
| `getFocusSuggestions()` | 30-day patterns, peak hour, preferred mode, moods | optimal_session_length, optimal_break_length, best_time_to_focus, recommended_mode, tips[], distraction_strategy, mood_note, priority_suggestion |
| `generateWeeklyReport()` | 7-day data + badges + XP | title, summary, trend, trend_explanation, best_day, worst_day, highlights[], challenges[], next_week_plan, motivational_close |
| `getAdaptiveTimer()` | 14-day session patterns | suggested_minutes (15-90), suggested_break (3-20), confidence, reasoning, mode, tip |
| `detectBurnout()` | 7-day metrics + mood trend | risk_level, risk_score (0-100), status, headline, signals[], recommendations[], recovery_plan, encouragement |
| `generateDailyMissions()` | streak, level, backlog, session stats | Array of 3 missions [easy, medium, hard] with title, description, xpReward, difficulty, category |

### ⚠️ AI Limitations (Honest Answer for Judges)

1. **No streaming** — All AI calls are one-shot, can take 3-8 seconds
2. **No conversation memory** — Each call is independent, no context history
3. **Paid API** — Mistral usage costs money, can't scale infinitely for free
4. **JSON parsing risk** — Mitral sometimes returns malformed JSON (we have fallbacks)
5. **Mission fallback** — If Mistral fails, 3 hardcoded default missions are returned
6. **No fine-tuning** — Generic model, not specialized for productivity

**Smart answer:** "We handle AI failures gracefully — hardcoded fallbacks ensure the app never breaks even if AI is unavailable."

---

*→ Continue in PART 3: Chrome Extension Deep Dive, Security, Scalability, Judge Q&A, Viva Prep*
