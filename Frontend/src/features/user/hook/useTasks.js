import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { userService } from '../service/user.service';
import {
  setTasksLoading, setTasks, addTask, updateTask, removeTask, setTasksError,
} from '../state/user.store';

export function useTasks() {
  const dispatch  = useDispatch();
  const { list: tasks, loading, error } = useSelector(s => s.user.tasks);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch(setTasksLoading(true));
    try {
      const res = await userService.getTasks(params);
      dispatch(setTasks(res.tasks || []));
    } catch (err) {
      dispatch(setTasksError(err.message));
    }
  }, [dispatch]);

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
    const res = await userService.patchStatus(id, status);
    dispatch(updateTask(res.task));
  }, [dispatch]);

  const deleteTask = useCallback(async (id) => {
    await userService.deleteTask(id);
    dispatch(removeTask(id));
  }, [dispatch]);

  return { tasks, loading, error, fetchTasks, createTask, editTask, changeStatus, deleteTask };
}
