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
      const [statsRes, tasksRes, weekRes, focusStatsRes] = await Promise.all([
        userService.getUserStats(),
        userService.getTasks({ status: 'pending' }),
        userService.getFocusWeek(),
        userService.getFocusStats(),
      ]);

      dispatch(setDashboardStats({
        userStats: statsRes.stats,
        focusStats: focusStatsRes.stats,
      }));
      dispatch(setRecentTasks(tasksRes.tasks?.slice(0, 5) || []));
      dispatch(setWeeklyFocus(weekRes.sessions || []));
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
