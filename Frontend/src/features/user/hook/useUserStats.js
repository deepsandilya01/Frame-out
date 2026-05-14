import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setStatsLoading, setUserStats, setBadges, setXPLog, setStatsError,
  setLeaderboardLoading, setLeaderboard, setLeaderboardError,
} from '../state/user.store';

export function useUserStats() {
  const dispatch  = useDispatch();
  const { data: stats, badges, xpLog, loading, error } = useSelector(s => s.user.userStats);

  const fetchStats = useCallback(async () => {
    dispatch(setStatsLoading(true));
    try {
      const [statsRes, badgesRes, xpRes] = await Promise.all([
        userService.getUserStats(),
        userService.getBadges(),
        userService.getXPLog(),
      ]);
      dispatch(setUserStats(statsRes.stats));
      dispatch(setBadges(badgesRes.badges || []));
      dispatch(setXPLog(xpRes.xpLog || []));
    } catch (err) {
      dispatch(setStatsError(err.message));
    }
  }, [dispatch]);

  return { stats, badges, xpLog, loading, error, fetchStats };
}

export function useLeaderboard() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(s => s.user.leaderboard);

  const fetchLeaderboard = useCallback(async (isSilent = false) => {
    if (!isSilent) dispatch(setLeaderboardLoading(true));
    try {
      const res = await userService.getLeaderboard();
      dispatch(setLeaderboard(res.leaderboard || []));
    } catch (err) {
      if (!isSilent) dispatch(setLeaderboardError(err.message));
    }
  }, [dispatch]);

  return { list, loading, error, fetchLeaderboard };
}
