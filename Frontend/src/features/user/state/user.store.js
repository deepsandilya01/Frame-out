import { createSlice } from '@reduxjs/toolkit';
import { normalizeUserStats } from '../utils/levelProgress';

const initialState = {
  // Theme
  theme: localStorage.getItem('fo-theme') || 'electric',

  // Dashboard
  dashboard: {
    stats: null,
    aiInsight: null,
    recentTasks: [],
    weeklyFocus: [],
    loading: false,
    error: null,
  },

  // User Profile
  profile: {
    data: null,
    loading: false,
    error: null,
  },

  // Tasks
  tasks: {
    list: [],
    loading: false,
    error: null,
  },

  // Focus Sessions
  focus: {
    activeSession: null,
    histories: [],
    stats: null,
    loading: false,
    error: null,
  },

  // Analytics
  analytics: {
    today: null,
    week: null,
    month: null,
    overview: null,
    loading: false,
    error: null,
  },

  // Heatmap
  heatmap: {
    year: [],
    loading: false,
    error: null,
  },

  // UserStats / Gamification
  userStats: {
    data: null,
    badges: [],
    xpLog: [],
    loading: false,
    error: null,
  },

  // AI Coach
  ai: {
    analysis: null,
    suggestions: null,
    weeklyReport: null,
    loading: false,
    error: null,
  },

  // Leaderboard
  leaderboard: {
    list: [],
    loading: false,
    error: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('fo-theme', action.payload);
    },

    // Dashboard
    setDashboardLoading: (state, action) => { state.dashboard.loading = action.payload; },
    setDashboardStats:   (state, action) => {
      state.dashboard.stats = {
        ...action.payload,
        userStats: normalizeUserStats(action.payload?.userStats),
      };
      state.dashboard.loading = false;
    },
    setAiInsight:        (state, action) => { state.dashboard.aiInsight = action.payload; },
    setRecentTasks:      (state, action) => { state.dashboard.recentTasks = action.payload; },
    setWeeklyFocus:      (state, action) => { state.dashboard.weeklyFocus = action.payload; },
    setDashboardError:   (state, action) => { state.dashboard.error = action.payload; state.dashboard.loading = false; },

    // Profile
    setProfileLoading: (state, action) => { state.profile.loading = action.payload; },
    setProfile:        (state, action) => { state.profile.data = action.payload; state.profile.loading = false; },
    setProfileError:   (state, action) => { state.profile.error = action.payload; state.profile.loading = false; },

    // Tasks
    setTasksLoading: (state, action) => { state.tasks.loading = action.payload; },
    setTasks:        (state, action) => { state.tasks.list = action.payload; state.tasks.loading = false; },
    addTask:         (state, action) => { state.tasks.list.unshift(action.payload); },
    updateTask:      (state, action) => {
      const idx = state.tasks.list.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.tasks.list[idx] = action.payload;
    },
    removeTask:      (state, action) => {
      state.tasks.list = state.tasks.list.filter(t => t._id !== action.payload);
    },
    setTasksError:   (state, action) => { state.tasks.error = action.payload; state.tasks.loading = false; },

    // Focus
    setFocusLoading:    (state, action) => { state.focus.loading = action.payload; },
    setActiveSession:   (state, action) => { state.focus.activeSession = action.payload; state.focus.loading = false; },
    clearActiveSession: (state)         => { state.focus.activeSession = null; },
    setFocusHistories:  (state, action) => { state.focus.histories = action.payload; state.focus.loading = false; },
    setFocusStats:      (state, action) => { state.focus.stats = action.payload; },
    setFocusError:      (state, action) => { state.focus.error = action.payload; state.focus.loading = false; },

    // Analytics
    setAnalyticsLoading: (state, action) => { state.analytics.loading = action.payload; },
    setAnalyticsToday:   (state, action) => { state.analytics.today = action.payload; },
    setAnalyticsWeek:    (state, action) => { state.analytics.week = action.payload; },
    setAnalyticsMonth:   (state, action) => { state.analytics.month = action.payload; },
    setAnalyticsOverview:(state, action) => { state.analytics.overview = action.payload; state.analytics.loading = false; },
    setAnalyticsError:   (state, action) => { state.analytics.error = action.payload; state.analytics.loading = false; },

    // Heatmap
    setHeatmapLoading: (state, action) => { state.heatmap.loading = action.payload; },
    setHeatmapYear:    (state, action) => { state.heatmap.year = action.payload; state.heatmap.loading = false; },
    setHeatmapError:   (state, action) => { state.heatmap.error = action.payload; state.heatmap.loading = false; },

    // UserStats
    setStatsLoading: (state, action) => { state.userStats.loading = action.payload; },
    setUserStats:    (state, action) => { state.userStats.data = normalizeUserStats(action.payload); state.userStats.loading = false; },
    setBadges:       (state, action) => { state.userStats.badges = action.payload; },
    setXPLog:        (state, action) => { state.userStats.xpLog = action.payload; },
    setStatsError:   (state, action) => { state.userStats.error = action.payload; state.userStats.loading = false; },

    // AI
    setAILoading:      (state, action) => { state.ai.loading = action.payload; },
    setAIAnalysis:     (state, action) => { state.ai.analysis = action.payload; state.ai.loading = false; },
    setAISuggestions:  (state, action) => { state.ai.suggestions = action.payload; },
    setAIWeeklyReport: (state, action) => { state.ai.weeklyReport = action.payload; state.ai.loading = false; },
    setAIError:        (state, action) => { state.ai.error = action.payload; state.ai.loading = false; },

    // Leaderboard
    setLeaderboardLoading: (state, action) => { state.leaderboard.loading = action.payload; },
    setLeaderboard:        (state, action) => { state.leaderboard.list = action.payload; state.leaderboard.loading = false; },
    setLeaderboardError:   (state, action) => { state.leaderboard.error = action.payload; state.leaderboard.loading = false; },
  },
});

export const {
  setTheme,
  setDashboardLoading, setDashboardStats, setAiInsight, setRecentTasks, setWeeklyFocus, setDashboardError,
  setProfileLoading, setProfile, setProfileError,
  setTasksLoading, setTasks, addTask, updateTask, removeTask, setTasksError,
  setFocusLoading, setActiveSession, clearActiveSession, setFocusHistories, setFocusStats, setFocusError,
  setAnalyticsLoading, setAnalyticsToday, setAnalyticsWeek, setAnalyticsMonth, setAnalyticsOverview, setAnalyticsError,
  setHeatmapLoading, setHeatmapYear, setHeatmapError,
  setStatsLoading, setUserStats, setBadges, setXPLog, setStatsError,
  setAILoading, setAIAnalysis, setAISuggestions, setAIWeeklyReport, setAIError,
  setLeaderboardLoading, setLeaderboard, setLeaderboardError,
} = userSlice.actions;

export default userSlice.reducer;
