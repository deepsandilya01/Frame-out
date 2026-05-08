import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useRef, useEffect } from 'react';
import { userService } from '../service/user.service';
import {
  setFocusLoading, setActiveSession, clearActiveSession,
  setFocusHistories, setFocusStats, setFocusError,
  setUserStats,
} from '../state/user.store';

export function useFocus() {
  const dispatch = useDispatch();
  const { activeSession, histories, stats, loading, error } = useSelector(s => s.user.focus);
  const intervalRef = useRef(null);

  const startSession = useCallback(async (data) => {
    dispatch(setFocusLoading(true));
    try {
      const res = await userService.startFocus(data);
      dispatch(setActiveSession(res.session));
      return res.session;
    } catch (err) {
      dispatch(setFocusError(err.message));
      throw err;
    }
  }, [dispatch]);

  const endSession = useCallback(async (data) => {
    dispatch(setFocusLoading(true));
    try {
      const res = await userService.endFocus(data);
      dispatch(clearActiveSession());
      // Refresh stats after session ends
      if (res.gamification) {
        const statsRes = await userService.getUserStats();
        dispatch(setUserStats(statsRes.stats));
      }
      return res;
    } catch (err) {
      dispatch(setFocusError(err.message));
      throw err;
    }
  }, [dispatch]);

  const fetchHistories = useCallback(async (params = {}) => {
    dispatch(setFocusLoading(true));
    try {
      const res = await userService.getFocusHistory(params);
      dispatch(setFocusHistories(res.sessions || []));
    } catch (err) {
      dispatch(setFocusError(err.message));
    }
  }, [dispatch]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await userService.getFocusStats();
      dispatch(setFocusStats(res.stats));
    } catch { /* silent */ }
  }, [dispatch]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return {
    activeSession, histories, stats, loading, error,
    startSession, endSession, fetchHistories, fetchStats,
  };
}
