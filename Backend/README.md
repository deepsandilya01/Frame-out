# Frame-Out Backend API

> **MERN Stack** — Node.js / Express / MongoDB / Redis  
> Base URL: `http://localhost:3000`  
> Auth: Cookie `token` **or** `Authorization: Bearer <token>`

---

## 🔐 Auth — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | New user register karo (email verification bhejta hai) |
| `POST` | `/login` | Login karo — JWT token milta hai |
| `GET` | `/verify-email?token=` | Email verify karo (link se aata hai) |
| `POST` | `/resend-verification` | Verification email dobara bhejo |
| `POST` | `/forgot-password` | Password reset link email pe bhejo |
| `POST` | `/reset-password` | Naya password set karo reset token ke saath |
| `GET` | `/get-me` | 🔒 Apni profile fetch karo |
| `GET` | `/logout` | 🔒 Logout karo (token blocklist ho jaata hai Redis mein) |
| `GET` | `/google` | Google OAuth login shuru karo |
| `GET` | `/google/callback` | Google OAuth callback (redirect hoga frontend pe) |

---

## ✅ Tasks — `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create` | 🔒 Naya task banao (title, priority, status, deadline) |
| `GET` | `/view` | 🔒 Apne saare tasks fetch karo (filter: `?status=pending`) |
| `PUT` | `/update/:id` | 🔒 Task ka title/priority/description update karo |
| `PATCH` | `/:id/status` | 🔒 Sirf task ka status update karo (pending/completed) |
| `DELETE` | `/delete/:id` | 🔒 Task delete karo |

---

## ⏱️ Focus Sessions — `/api/focus`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | 🔒 Focus session shuru karo (pomodoro: 25m, ya custom duration) |
| `POST` | `/end` | 🔒 Session khatam karo — XP + badges auto-award hote hain |
| `GET` | `/histories` | 🔒 Saari sessions ki paginated history |
| `GET` | `/stats` | 🔒 Total focus time, streak, rank, level ka summary |
| `GET` | `/today` | 🔒 Aaj ki saari sessions + total minutes |
| `GET` | `/week` | 🔒 Is hafte ki saari sessions |
| `GET` | `/month` | 🔒 Is mahine ki saari sessions |
| `GET` | `/calendar` | 🔒 Daily focus minutes ka map (current month) |

---

## 📊 Analytics — `/api/analytics`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync` | 🔒 Aaj ka analytics snapshot manually sync karo |
| `GET` | `/today` | 🔒 Aaj ka focus + task analytics |
| `GET` | `/week` | 🔒 Is hafte ka analytics breakdown |
| `GET` | `/month` | 🔒 Is mahine ka analytics |
| `GET` | `/overview` | 🔒 Saari time ka high-level overview |

---

## 🌡️ Heatmap — `/api/heatmap`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync` | 🔒 Aaj ka heatmap cell sync karo (GitHub style intensity 0–4) |
| `GET` | `/year` | 🔒 Poore 365 din ka heatmap data (missing days = 0 fill) |
| `GET` | `/today` | 🔒 Sirf aaj ka heatmap cell |
| `GET` | `/range?from=&to=` | 🔒 Custom date range ka heatmap (YYYY-MM-DD format) |

---

## 🎮 User Stats & Gamification — `/api/userstats`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me` | 🔒 Apna XP, level, streak, badges, total sessions fetch karo |
| `GET` | `/badges` | 🔒 Saare earned badges ki list |
| `GET` | `/xp-log` | 🔒 Last 100 XP transactions ka audit log |
| `GET` | `/leaderboard` | 🔒 Top 10 users by XP |
| `GET` | `/level-map` | 🔒 Saare levels ke XP thresholds |
| `POST` | `/award-session` | 🔒 Manually session complete karne pe XP do (internal use) |
| `POST` | `/award-task` | 🔒 Task complete karne pe XP do |
| `POST` | `/perfect-day` | 🔒 Perfect day bonus XP do (4+ sessions + 3+ tasks) |

---

## 🤖 AI — `/api/ai`  *(Powered by Mistral)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/productivity-analysis` | 🔒 Last 7 din ka data analyze karke AI insights do |
| `POST` | `/focus-suggestions` | 🔒 30 din ke patterns se personalized focus tips do |
| `POST` | `/weekly-report` | 🔒 Weekly narrative report with trends + next week plan |

---

## 🏅 Badges System

| Badge | Condition |
|-------|-----------|
| 🎯 First Focus | Pehli focus session complete |
| 🔥 On Fire | 3-day streak |
| ⚡ Week Warrior | 7-day streak |
| 🏆 Iron Discipline | 30-day streak |
| 💯 Century Focus | 100 hours total focus |
| ✅ Task Crusher | 10 tasks complete |
| 🚀 Productivity Beast | 50 tasks complete |
| ⭐ Perfect Day | Ek din mein 4+ sessions + 3+ tasks |
| 🌟 Rising Star | Level 5 reach |
| 👑 Master Mind | Level 10 reach |
| 🧘 Deep Focus | Session bina kisi distraction ke |
| 🌅 Early Bird | Session subah 7 baje se pehle shuru |

---

## 🔑 Environment Variables

```env
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
REDIS_HOST=...
REDIS_PORT=...
REDIS_PASSWORD=...
MISTRAL_API_KEY=...         # AI features ke liye
RESEND_API_KEY=...          # Email verification ke liye
GOOGLE_CLIENT_ID=...        # Google OAuth ke liye
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
```

---

## 🚀 Quick Start

```bash
npm install
npm run dev      # nodemon se development server
```

> 🔒 = Private route — requires auth token
