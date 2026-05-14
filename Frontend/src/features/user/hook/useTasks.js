import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setTasksLoading, setTasks, addTask, updateTask, removeTask, setTasksError,
  setUserStats, addNotification,
} from '../state/user.store';
import { applyMissedDeadlinePenalties, isMissedDeadlineTask } from '../utils/taskPenalty';
import { toast } from 'react-hot-toast';

export function useTasks() {
  const dispatch  = useDispatch();
  const { list: tasks, loading, error } = useSelector(s => s.user.tasks);

  const refreshUserStats = useCallback(async () => {
    const statsRes = await userService.getUserStats();
    dispatch(setUserStats(statsRes.stats));
  }, [dispatch]);

  const checkDeadlines = useCallback((tasksList) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const urgentTasks = tasksList.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.deadline) return false;
      const dl = new Date(t.deadline);
      dl.setHours(0,0,0,0);
      return dl.getTime() === today.getTime() || dl.getTime() === tomorrow.getTime();
    });

    if (urgentTasks.length > 0) {
      const messages = urgentTasks.map(t => {
        const dl = new Date(t.deadline);
        dl.setHours(23, 59, 59, 999);
        const diffMs = dl.getTime() - new Date().getTime();
        const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
        
        let timeStr = diffHours > 0 ? `${diffHours}h left` : "due very soon";
        if (diffHours > 24) {
          timeStr = `${Math.floor(diffHours / 24)}d ${diffHours % 24}h left`;
        }

        return `"${t.title}" (${timeStr})`;
      });

      const message = `Warning: ${messages.join(', ')} approaching deadline!`;
      toast.error(message, { id: 'deadline-warning', duration: 7000 });
      dispatch(addNotification({
        title: 'Approaching Deadline',
        message: message,
        type: 'deadline',
        severity: 'high'
      }));
    }
  }, [dispatch]);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch(setTasksLoading(true));
    try {
      const res = await userService.getTasks(params);
      const fetchedTasks = res.tasks || [];
      dispatch(setTasks(fetchedTasks));

      // Check for approaching deadlines
      checkDeadlines(fetchedTasks);

      const updatedTasks = await applyMissedDeadlinePenalties(fetchedTasks);
      updatedTasks.forEach(task => {
        dispatch(updateTask(task));
        dispatch(addNotification({
          title: 'Penalty Applied',
          message: `Deadline missed for "${task.title}". Penalty of -${task.penalty || 5} XP applied.`,
          type: 'error',
          severity: 'high'
        }));
      });
      if (updatedTasks.length > 0) await refreshUserStats();
    } catch (err) {
      dispatch(setTasksError(err.message));
    }
  }, [dispatch, refreshUserStats, checkDeadlines]);

  const createTask = useCallback(async (data) => {
    try {
      const res = await userService.createTask(data);
      dispatch(addTask(res.task));
      toast.success("Task created successfully!");
      dispatch(addNotification({
        title: 'Task Created',
        message: `Task "${res.task.title}" has been added to your queue.`,
        type: 'task',
        severity: 'low'
      }));
      return res.task;
    } catch (err) {
      toast.error("Failed to create task: " + err.message);
      throw err;
    }
  }, [dispatch]);

  const editTask = useCallback(async (id, data) => {
    try {
      const res = await userService.updateTask(id, data);
      dispatch(updateTask(res.task));
      toast.success("Task updated.");
      return res.task;
    } catch (err) {
      toast.error("Update failed.");
      throw err;
    }
  }, [dispatch]);

  const changeStatus = useCallback(async (id, status) => {
    const currentTask = tasks.find(task => task._id === id);
    let shouldRefreshStats = false;
    
    try {
      if (status === 'completed' && isMissedDeadlineTask(currentTask)) {
        const penaltyRes = await userService.missDeadline(id);
        if (penaltyRes.task) dispatch(updateTask(penaltyRes.task));
        shouldRefreshStats = Boolean(penaltyRes.gamification);
      }

      const res = await userService.patchStatus(id, status);
      dispatch(updateTask(res.task));
      
      if (status === 'completed') {
        toast.success("Task completed! XP Earned.");
        dispatch(addNotification({
          title: 'Mission Accomplished',
          message: `You've completed "${res.task.title}" and earned XP!`,
          type: 'success',
          severity: 'medium'
        }));
      }

      if (shouldRefreshStats || res.gamification) await refreshUserStats();
    } catch (err) {
      toast.error("Status update failed.");
    }
  }, [dispatch, refreshUserStats, tasks]);

  const deleteTask = useCallback(async (id) => {
    try {
      const res = await userService.deleteTask(id);
      dispatch(removeTask(id));
      toast.success("Task deleted.");
      if (res.gamification) await refreshUserStats();
    } catch (err) {
      toast.error("Delete failed.");
    }
  }, [dispatch, refreshUserStats]);

  return { tasks, loading, error, fetchTasks, createTask, editTask, changeStatus, deleteTask };
}

