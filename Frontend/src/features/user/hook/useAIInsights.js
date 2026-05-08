import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setAILoading, setAIAnalysis, setAISuggestions, setAIWeeklyReport, setAIError,
} from '../state/user.store';

export function useAIInsights() {
  const dispatch = useDispatch();
  const ai = useSelector(s => s.user.ai);

  const fetchAnalysis = useCallback(async () => {
    dispatch(setAILoading(true));
    try {
      const res = await userService.getProductivityAnalysis();
      dispatch(setAIAnalysis(res.analysis));
    } catch (err) {
      dispatch(setAIError(err.message));
    }
  }, [dispatch]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await userService.getFocusSuggestions();
      dispatch(setAISuggestions(res.suggestions));
    } catch { /* silent */ }
  }, [dispatch]);

  const fetchWeeklyReport = useCallback(async () => {
    dispatch(setAILoading(true));
    try {
      const res = await userService.getWeeklyReport();
      dispatch(setAIWeeklyReport(res.report));
    } catch (err) {
      dispatch(setAIError(err.message));
    }
  }, [dispatch]);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([fetchAnalysis(), fetchSuggestions(), fetchWeeklyReport()]);
  }, [fetchAnalysis, fetchSuggestions, fetchWeeklyReport]);

  return { ai, fetchAnalysis, fetchSuggestions, fetchWeeklyReport, fetchAll };
}
