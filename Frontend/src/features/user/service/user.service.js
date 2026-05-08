import axios from 'axios';

const BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // Uses HttpOnly cookies set by backend on login
});

// ─── AUTH ───────────────────────────────────────────────────────────────────
export const userService = {

  getMe: () => api.get('/auth/get-me').then(r => r.data),
  logout: () => api.get('/auth/logout').then(r => r.data),

  // ─── TASKS ────────────────────────────────────────────────────────────────
  getTasks:    (params) => api.get('/tasks/view', { params }).then(r => r.data),
  createTask:  (data)   => api.post('/tasks/create', data).then(r => r.data),
  updateTask:  (id, data) => api.put(`/tasks/update/${id}`, data).then(r => r.data),
  patchStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data),
  deleteTask:  (id)     => api.delete(`/tasks/delete/${id}`).then(r => r.data),

  // ─── FOCUS SESSIONS ───────────────────────────────────────────────────────
  startFocus:     (data) => api.post('/focus/start', data).then(r => r.data),
  endFocus:       (data) => api.post('/focus/end', data).then(r => r.data),
  getFocusHistory:(params) => api.get('/focus/histories', { params }).then(r => r.data),
  getFocusStats:  () => api.get('/focus/stats').then(r => r.data),
  getFocusToday:  () => api.get('/focus/today').then(r => r.data),
  getFocusWeek:   () => api.get('/focus/week').then(r => r.data),
  getFocusMonth:  () => api.get('/focus/month').then(r => r.data),
  getFocusCalendar:() => api.get('/focus/calendar').then(r => r.data),

  // ─── ANALYTICS ────────────────────────────────────────────────────────────
  syncAnalytics:      () => api.post('/analytics/sync').then(r => r.data),
  getAnalyticsToday:  () => api.get('/analytics/today').then(r => r.data),
  getAnalyticsWeek:   () => api.get('/analytics/week').then(r => r.data),
  getAnalyticsMonth:  () => api.get('/analytics/month').then(r => r.data),
  getAnalyticsOverview:() => api.get('/analytics/overview').then(r => r.data),

  // ─── HEATMAP ──────────────────────────────────────────────────────────────
  syncHeatmap:    () => api.post('/heatmap/sync').then(r => r.data),
  getHeatmapYear: () => api.get('/heatmap/year').then(r => r.data),
  getHeatmapToday:() => api.get('/heatmap/today').then(r => r.data),
  getHeatmapRange:(from, to) => api.get('/heatmap/range', { params: { from, to } }).then(r => r.data),

  // ─── USER STATS ───────────────────────────────────────────────────────────
  getUserStats:   () => api.get('/userstats/me').then(r => r.data),
  getBadges:      () => api.get('/userstats/badges').then(r => r.data),
  getXPLog:       () => api.get('/userstats/xp-log').then(r => r.data),
  getLeaderboard: () => api.get('/userstats/leaderboard').then(r => r.data),
  getLevelMap:    () => api.get('/userstats/level-map').then(r => r.data),

  // ─── AI COACH ─────────────────────────────────────────────────────────────
  getProductivityAnalysis: () => api.post('/ai/productivity-analysis').then(r => r.data),
  getFocusSuggestions:     () => api.post('/ai/focus-suggestions').then(r => r.data),
  getWeeklyReport:         () => api.post('/ai/weekly-report').then(r => r.data),
};
