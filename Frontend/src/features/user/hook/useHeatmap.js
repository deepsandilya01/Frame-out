import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import { setHeatmapLoading, setHeatmapYear, setHeatmapError } from '../state/user.store';

export function useHeatmap() {
  const dispatch = useDispatch();
  const { year, loading, error } = useSelector(s => s.user.heatmap);

  const fetchYear = useCallback(async () => {
    dispatch(setHeatmapLoading(true));
    try {
      await userService.syncHeatmap();
      const res = await userService.getHeatmapYear();
      dispatch(setHeatmapYear(res.grid || res.heatmap || []));
    } catch (err) {
      dispatch(setHeatmapError(err.message));
    }
  }, [dispatch]);

  return { year, loading, error, fetchYear };
}
