import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setDashboardLoading, setDashboardStats, setAiInsight,
  setRecentTasks, setWeeklyFocus, setDashboardError,
} from '../state/user.store';
import { applyMissedDeadlinePenalties } from '../utils/taskPenalty';

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

      const focusStats = {
        ...focusStatsRes.stats,
        todayMinutes: todayRes.totalMinutes || 0,
        completedSessions: statsRes.stats?.completedSessions || statsRes.stats?.totalSessionsCompleted || 0,
        activity: activityRes.data // Pass activity data through
      };

      dispatch(setDashboardStats({
        userStats: statsRes.stats,
        focusStats,
      }));
      const fetchedTasks = tasksRes.tasks || [];
      dispatch(setRecentTasks(fetchedTasks.slice(0, 5)));

      const penalizedTasks = await applyMissedDeadlinePenalties(fetchedTasks);
      if (penalizedTasks.length > 0) {
        const penalizedById = new Map(penalizedTasks.map(task => [task._id, task]));
        dispatch(setRecentTasks(
          fetchedTasks.map(task => penalizedById.get(task._id) || task).slice(0, 5)
        ));

        const refreshedStats = await userService.getUserStats();
        dispatch(setDashboardStats({
          userStats: refreshedStats.stats,
          focusStats,
        }));
      }

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
