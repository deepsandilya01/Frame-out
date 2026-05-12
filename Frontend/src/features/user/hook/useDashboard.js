import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setDashboardLoading, setDashboardStats, setAiInsight,
  setRecentTasks, setWeeklyFocus, setDashboardError,
} from '../state/user.store';

export function useDashboard() {
  const dispatch = useDispatch();
  const dashboard = useSelector(s => s.user.dashboard);
  const userStats = useSelector(s => s.user.userStats.data);

  const loadDashboard = useCallback(async () => {
    dispatch(setDashboardLoading(true));
    try {
      const [statsRes, tasksRes, weekRes, focusStatsRes, todayRes, activityRes] = await Promise.all([
        userService.getUserStats(),
        userService.getTasks({ status: 'pending' }),
        userService.getFocusWeek(),
        userService.getFocusStats(),
        userService.getFocusToday(),
        userService.getActivityStats()
      ]);

      dispatch(setDashboardStats({
        userStats: statsRes.stats,
        focusStats: {
          ...focusStatsRes.stats,
          todayMinutes: todayRes.totalMinutes || 0,
          completedSessions: statsRes.stats?.completedSessions || statsRes.stats?.totalSessionsCompleted || 0,
          activity: activityRes.data // Pass activity data through
        },
      }));
      dispatch(setRecentTasks(tasksRes.tasks?.slice(0, 5) || []));
      dispatch(setWeeklyFocus({
        sessions: weekRes.sessions || [],
        activityWeek: activityRes.data?.week || []
      }));
    } catch (err) {
      dispatch(setDashboardError(err.message));
    }
  }, [dispatch]);

  const loadAIInsight = useCallback(async () => {
    try {
      const res = await userService.getFocusSuggestions();
      dispatch(setAiInsight(res.suggestions));
    } catch { /* silent — AI is optional */ }
  }, [dispatch]);

  return { dashboard, userStats, loadDashboard, loadAIInsight };
}
