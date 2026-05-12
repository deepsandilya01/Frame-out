# Frame-Out

Frame-Out is a full-stack productivity, focus, analytics, and digital-wellbeing platform. It combines a web app, an Express API, AI-powered coaching, gamified progress, and a Chrome extension that helps users block distractions and track browser activity.

The project currently has three major applications:

- `Frontend`: React/Vite user-facing web app.
- `Backend`: Express/MongoDB API.
- `Extension`: Chrome Manifest V3 focus extension.

An admin panel is fully integrated for platform management, featuring real-time stats, user management, and system-wide audit logging.

## Product Vision

Frame-Out is built around one idea: help users understand and improve their focus behavior with minimal friction.

The app supports:

- Authentication with email/password and Google OAuth.
- Email verification and password reset flows.
- A protected dashboard for focus, productivity, and personal stats.
- Task management.
- Focus sessions and deep work modes.
- Heatmap and analytics visualizations.
- AI-generated productivity insights and focus suggestions.
- Journal and daily reflection.
- Daily missions, XP, badges, levels, ranks, and leaderboard.
- Chrome extension based website blocking and activity tracking.
- **Admin Dashboard**: Comprehensive platform management for authorized personnel.

## Current Architecture

```txt
.
|-- Backend/
|   |-- server.js
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- config/
|       |-- controllers/
|       |-- middlewares/
|       |-- models/
|       |-- routes/
|       |-- services/
|       |-- utils/
|       `-- validator/
|
|-- Frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- index.html
|   |-- public/
|   `-- src/
|       |-- app/
|       |-- assets/
|       |-- components/
|       |-- features/
|       `-- lib/
|
`-- Extension/
    |-- manifest.json
    |-- background.js
    |-- popup.html
    |-- popup.js
    |-- options.html
    |-- options.js
    |-- blocked.html
    |-- content/
    `-- icons/
```

## Tech Stack

### Frontend

- React 19
- Vite 8
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS
- GSAP
- Recharts
- Lucide React
- React Hook Form
- Zod

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- Passport Google OAuth
- Redis with ioredis
- Resend for transactional emails
- Mistral AI
- Helmet
- CORS
- Express rate limit
- Cookie parser
- Express validator

### Chrome Extension

- Manifest V3
- Declarative Net Request
- Chrome storage
- Chrome tabs API
- Chrome alarms API
- Chrome cookies API
- Chrome idle API
- Content scripts for YouTube Shorts and Instagram Reels blocking

## Feature Breakdown

### Authentication

The auth module supports:

- Register with email, password, contact, and full name.
- Email verification via JWT verification link.
- Login with email/password.
- Google OAuth login.
- Forgot password email flow.
- Reset password with token.
- Logout with Redis token blocklist.
- Current user session check.

Important implementation details:

- JWTs are issued by the backend.
- Token is sent in an HTTP-only cookie.
- Email/password login also returns a token to the frontend.
- Frontend stores the token in localStorage as a fallback for cross-site cookie issues.
- Protected backend routes accept either cookie token or `Authorization: Bearer <token>`.

### Dashboard

The dashboard aggregates:

- User stats.
- Focus stats.
- Recent tasks.
- Weekly focus history.
- AI insight data.
- XP and rank progress.

### Tasks

Task features include:

- Create task.
- View tasks.
- Update task.
- Delete task.
- Patch task status.
- Award XP when task progress is completed.

### Focus Sessions

Focus functionality includes:

- Start focus session.
- End focus session.
- Track completed/incomplete sessions.
- Track distractions.
- Fetch session history.
- Fetch daily, weekly, monthly, and calendar data.
- Mood analytics support.

### Analytics

Analytics are generated from raw task and focus data.

Tracked data includes:

- Total focus minutes.
- Total sessions.
- Completed sessions.
- Distractions.
- Tasks created.
- Tasks completed.
- Productivity score.
- Dopamine score.
- Daily snapshots.
- Weekly and monthly aggregations.
- All-time overview.

### Heatmap

The heatmap module tracks day-level activity.

Supported operations:

- Sync heatmap cell.
- Mark today as active.
- Get current year heatmap.
- Get range heatmap.
- Get today's heatmap cell.

### User Stats and Gamification

Gamification includes:

- XP awards for focus sessions.
- XP awards for tasks.
- Perfect day bonus.
- Level map.
- Leaderboard.
- Badges.
- Rank.
- XP log.

### Daily Missions

Daily missions are generated and tracked per user.

Supported features:

- Fetch or generate today's missions.
- Complete mission.
- Regenerate missions.
- XP rewards for mission completion.

### Journal and Reflection

Reflection features include:

- Get or create today's journal entry.
- Save today's journal.
- Fetch journal history.
- Fetch entry by date.
- Mood/reflection data used by insights and AI features.

### AI Coach

AI features use Mistral.

Current AI endpoints:

- Productivity analysis.
- Focus suggestions.
- Weekly report.
- Adaptive timer.
- Burnout check.
- Daily mission generation.

The AI service asks Mistral for strict JSON responses, then parses and normalizes the result for the frontend.

### Chrome Extension

The extension currently provides:

- Focus mode toggle.
- Website blocking with declarativeNetRequest.
- Default blocklist for distracting sites.
- Custom blocklist support.
- Optional ad-domain blocking.
- YouTube Shorts blocker.
- Instagram Reels blocker.
- Active tab tracking.
- Screen-time aggregation.
- Periodic activity sync to backend.
- **Admin Management**: Direct task assignment and system audit integration.

Current limitation:

```js
const BACKEND_URL = "https://hackathon-1-2wnx.onrender.com/api";
```

This is hardcoded in `Extension/background.js`. It should be made configurable before production extension release.

## Backend API

All API routes are mounted under:

```txt
/api
```

### Auth Routes

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/get-me
GET  /api/auth/logout
```

### Task Routes

```txt
POST   /api/tasks/create
GET    /api/tasks/view
PUT    /api/tasks/update/:id
DELETE /api/tasks/delete/:id
PATCH  /api/tasks/:id/status
```

### Focus Routes

```txt
POST /api/focus/start
POST /api/focus/end
GET  /api/focus/histories
GET  /api/focus/stats
GET  /api/focus/today
GET  /api/focus/week
GET  /api/focus/month
GET  /api/focus/calendar
GET  /api/focus/mood-analytics
```

### Analytics Routes

```txt
POST /api/analytics/sync
GET  /api/analytics/today
GET  /api/analytics/week
GET  /api/analytics/month
GET  /api/analytics/overview
POST /api/analytics/sync-extension
GET  /api/analytics/activity-stats
```

### Heatmap Routes

```txt
POST /api/heatmap/sync
POST /api/heatmap/active
GET  /api/heatmap/year
GET  /api/heatmap/range
GET  /api/heatmap/today
```

### User Stats Routes

```txt
POST /api/userstats/award-session
POST /api/userstats/award-task
POST /api/userstats/perfect-day
GET  /api/userstats/me
GET  /api/userstats/xp-log
GET  /api/userstats/badges
GET  /api/userstats/leaderboard
GET  /api/userstats/level-map
```

### AI Routes

```txt
POST /api/ai/productivity-analysis
POST /api/ai/focus-suggestions
POST /api/ai/weekly-report
GET  /api/ai/adaptive-timer
GET  /api/ai/burnout-check
```

### Journal Routes

```txt
GET /api/journal/today
PUT /api/journal/today
GET /api/journal/history
GET /api/journal/:date
```

### Mission Routes

```txt
GET   /api/missions/today
PATCH /api/missions/:missionId/complete
POST  /api/missions/regenerate
```

## Frontend Routes

### Public Routes

```txt
/
/login
/register
/forgot-password
/reset-password
/verify-email
/legal/:type
/team
```

### Protected Routes

```txt
/dashboard
/tasks
/focus
/insights
/reflect
/ai-coach
/leaderboard
/profile
/settings
```

The frontend uses browser routing, so production hosting must fallback all non-asset routes to `index.html`.

## Data Model Overview

The backend uses Mongoose models for:

- User
- Task
- Focus session
- Analytics snapshot
- Activity summary
- Heatmap cell
- Journal entry
- Mission
- User stats

### User Model Highlights

The user model stores:

- Email
- Password hash
- Google ID
- Full name
- Contact
- Role
- Verification status
- Level
- Rank
- Streak
- Longest streak
- Total focus time
- Total sessions
- Total distractions
- Reset password token data

The `role` field already supports:

```txt
user
admin
```

This makes the future admin panel easier to add.

### Admin Dashboard Features (Completed)

- **Platform Stats**: Total users, sessions, tasks, and aggregate focus minutes.
- **Growth Charts**: Daily user acquisition trends with timezone synchronization.
- **User Management**: Search, role updates (User/Admin), and account termination.
- **Directives**: Admin-assigned tasks with elevated XP rewards (20 XP).
- **Audit Trail**: Real-time logging of all administrative actions with target tracking.
- **Accessibility**: Automatic fallback for the primary admin email to prevent lockout.

## Local Setup

### Install Backend

```bash
cd Backend
npm install
```

### Install Frontend

```bash
cd Frontend
npm install
```

### Run Backend

```bash
cd Backend
npm run dev
```

Backend local URL:

```txt
http://localhost:3000
```

### Run Frontend

```bash
cd Frontend
npm run dev
```

Frontend local URL:

```txt
http://localhost:5173
```

## Environment Variables

Do not commit real `.env` files. The repo ignores `.env` in both frontend and backend.

### Backend `.env`

```env
PORT=3000
NODE_ENV=development

MONGO_URI=
JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BACKEND_URI=localhost:3000
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

FRONTEND_URL=localhost:5173

RESEND_API_KEY=

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

MISTRAL_API_KEY=
```

### Backend Production Example

```env
NODE_ENV=production
BACKEND_URI=resilient-enchantment-production.up.railway.app
GOOGLE_CALLBACK_URL=https://resilient-enchantment-production.up.railway.app/api/auth/google/callback
FRONTEND_URL=frame-out-g9wr.vercel.app
```

### Frontend `.env`

```env
BACKEND_URI=resilient-enchantment-production.up.railway.app
BACKEND_USE_LOCAL=false
```

For local backend:

```env
BACKEND_USE_LOCAL=true
```

Restart Vite after changing frontend environment variables.

## Google OAuth Setup

Google OAuth is strict. The redirect URI must match exactly.

Add these redirect URIs in Google Cloud Console:

```txt
http://localhost:3000/api/auth/google/callback
https://resilient-enchantment-production.up.railway.app/api/auth/google/callback
```

Google Cloud path:

```txt
APIs & Services -> Credentials -> OAuth 2.0 Client ID -> Authorized redirect URIs
```

If Google shows:

```txt
redirect_uri_mismatch
```

then one of these is wrong:

- Railway `GOOGLE_CALLBACK_URL`
- Google Console authorized redirect URI
- Backend deploy is still running old environment variables
- The path is missing `/api`
- `http` was used instead of `https`

## Deployment

### Backend on Railway

Recommended Railway setup:

- Root directory: `Backend`
- Install command: `npm install`
- Start command: `npm start`

Required environment variables:

- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BACKEND_URI`
- `GOOGLE_CALLBACK_URL`
- `FRONTEND_URL`
- `RESEND_API_KEY`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `MISTRAL_API_KEY`

After deployment, check Railway logs for:

```txt
Server listening on port ...
Google OAuth callback URL: ...
```

### Frontend on Vercel

If Vercel root directory is `Frontend`:

```txt
Install command: npm install
Build command: npm run build
Output directory: dist
```

If Vercel root directory is repo root:

```txt
Install command: cd Frontend && npm install
Build command: cd Frontend && npm run build
Output directory: Frontend/dist
```

SPA fallback rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Without this rewrite, direct visits to `/dashboard`, `/login`, or `/reset-password` can show Vercel `404: NOT_FOUND`.

## Extension Setup

Load extension locally:

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click `Load unpacked`.
4. Select the `Extension` folder.

Current extension permissions:

- `storage`
- `declarativeNetRequest`
- `declarativeNetRequestFeedback`
- `activeTab`
- `scripting`
- `tabs`
- `alarms`
- `cookies`
- `idle`

Host permissions include common distracting sites and `<all_urls>`.

## Security Notes

Current security measures:

- Password hashing with bcrypt.
- JWT-based auth.
- HTTP-only auth cookie.
- Bearer token fallback.
- Redis token blocklist on logout.
- Helmet security headers.
- CORS restrictions.
- Express rate limiting.
- Request validation on selected auth/task/focus routes.

Production hardening recommendations:

- Add refresh tokens and shorter access token expiry.
- Add account disable/ban support before admin launch.
- Add audit logs for admin actions.
- Add stricter CORS origins.
- Add request body validation for all routes.
- Add extension payload validation.
- Add centralized error codes.
- Add monitoring for auth failures and AI API failures.

## Known Issues and Risks

### 1. Extension Backend URL Is Hardcoded

`Extension/background.js` currently points to:

```js
const BACKEND_URL = "http://localhost:3000/api";
```

For production extension support, make this configurable.

### 2. Google OAuth Can Break If Env Is Wrong

The exact callback must be:

```txt
https://resilient-enchantment-production.up.railway.app/api/auth/google/callback
```

### 3. Google OAuth Cookie Flow Can Be Blocked

Google OAuth currently redirects after setting a cross-site cookie. Some browsers may block this. A robust improvement is to redirect with a short-lived one-time code and exchange it on the frontend.

### 4. Lint Is Not Clean Yet

Frontend lint currently reports many issues, including unused imports and some React hook ordering warnings. The app can build, but lint should be cleaned before production.

### 5. Test Suite Is Missing

Backend `npm test` is currently a placeholder. Add tests before heavy refactoring.

## Developer Commands

Backend:

```bash
cd Backend
npm run dev
npm start
```

Frontend:

```bash
cd Frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Recommended Next Steps

Short-term:

1. Fix Google OAuth environment variables in Railway and Google Cloud.
2. Fix Vercel SPA rewrite/output directory.
3. Make extension backend URL configurable.
4. Clean frontend lint issues.
5. Add a small backend smoke test suite.

Medium-term:

1. Build admin middleware and admin routes.
2. Build admin dashboard UI.
3. Add audit log model.
4. Add account status field to user model.
5. Add production monitoring.

Long-term:

1. Publish extension.
2. Add team/workspace support.
3. Add subscription/payment layer.
4. Add advanced AI weekly reports.
5. Add organization-level analytics.

## Troubleshooting

### Vercel Shows `404: NOT_FOUND`

Check:

- Vercel root directory.
- Build command.
- Output directory.
- SPA rewrite.

### API Calls Return `401 Unauthorized`

Check:

- User is logged in.
- Token exists in cookie or localStorage.
- Backend is deployed.
- CORS allows frontend origin.
- Frontend points to correct backend.

### Frontend Calls `localhost:3000`

Set:

```env
BACKEND_URI=resilient-enchantment-production.up.railway.app
BACKEND_USE_LOCAL=false
```

Then restart Vite.

### Google Shows `redirect_uri_mismatch`

Use this exact callback everywhere:

```txt
https://resilient-enchantment-production.up.railway.app/api/auth/google/callback
```

Then redeploy Railway.

### Extension Does Not Sync Activity

Check:

- Backend URL in `Extension/background.js`.
- User is logged in.
- Token cookie exists for the backend domain.
- Extension has cookies permission.
- Backend `/api/analytics/sync-extension` is reachable.
