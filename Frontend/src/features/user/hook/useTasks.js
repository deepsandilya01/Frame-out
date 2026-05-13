import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setTasksLoading, setTasks, addTask, updateTask, removeTask, setTasksError,
  setUserStats,
} from '../state/user.store';
import { applyMissedDeadlinePenalties, isMissedDeadlineTask } from '../utils/taskPenalty';

export function useTasks() {
  const dispatch  = useDispatch();
  const { list: tasks, loading, error } = useSelector(s => s.user.tasks);

  const refreshUserStats = useCallback(async () => {
    const statsRes = await userService.getUserStats();
    dispatch(setUserStats(statsRes.stats));
  }, [dispatch]);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch(setTasksLoading(true));
    try {
      const res = await userService.getTasks(params);
      const fetchedTasks = res.tasks || [];
      dispatch(setTasks(fetchedTasks));

      const updatedTasks = await applyMissedDeadlinePenalties(fetchedTasks);
      updatedTasks.forEach(task => dispatch(updateTask(task)));
      if (updatedTasks.length > 0) await refreshUserStats();
    } catch (err) {
      dispatch(setTasksError(err.message));
    }
  }, [dispatch, refreshUserStats]);

  const createTask = useCallback(async (data) => {
    const res = await userService.createTask(data);
    dispatch(addTask(res.task));
    return res.task;
  }, [dispatch]);

  const editTask = useCallback(async (id, data) => {
    const res = await userService.updateTask(id, data);
    dispatch(updateTask(res.task));
    return res.task;
  }, [dispatch]);

  const changeStatus = useCallback(async (id, status) => {
    const currentTask = tasks.find(task => task._id === id);
    let shouldRefreshStats = false;
    if (status === 'completed' && isMissedDeadlineTask(currentTask)) {
      const penaltyRes = await userService.missDeadline(id);
      if (penaltyRes.task) dispatch(updateTask(penaltyRes.task));
      shouldRefreshStats = Boolean(penaltyRes.gamification);
    }

    const res = await userService.patchStatus(id, status);
    dispatch(updateTask(res.task));
    if (shouldRefreshStats || res.gamification) await refreshUserStats();
  }, [dispatch, refreshUserStats, tasks]);

  const deleteTask = useCallback(async (id) => {
    const res = await userService.deleteTask(id);
    dispatch(removeTask(id));
    if (res.gamification) await refreshUserStats();
  }, [dispatch, refreshUserStats]);

  return { tasks, loading, error, fetchTasks, createTask, editTask, changeStatus, deleteTask };
}
