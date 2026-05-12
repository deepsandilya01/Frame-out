import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setAnalyticsLoading, setAnalyticsToday, setAnalyticsWeek,
  setAnalyticsMonth, setAnalyticsOverview, setAnalyticsError,
} from '../state/user.store';

export function useAnalytics() {
  const dispatch   = useDispatch();
  const analytics  = useSelector(s => s.user.analytics);

  const fetchAll = useCallback(async () => {
    dispatch(setAnalyticsLoading(true));
    try {
      await userService.syncAnalytics();
      const [today, week, month, overview] = await Promise.all([
        userService.getAnalyticsToday(),
        userService.getAnalyticsWeek(),
        userService.getAnalyticsMonth(),
        userService.getAnalyticsOverview(),
      ]);
      dispatch(setAnalyticsToday(today.snapshot));
      dispatch(setAnalyticsWeek(week));
      dispatch(setAnalyticsMonth(month));
      dispatch(setAnalyticsOverview(overview.overview));
    } catch (err) {
      dispatch(setAnalyticsError(err.message));
    }
  }, [dispatch]);

  return { analytics, fetchAll };
}
