import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { adminService } from '../service/admin.service';
import { 
  setAdminLoading, setAdminStats, setAdminUsers, setAdminLogs,
  updateUserInList, removeUserFromList, setAdminError 
} from '../state/admin.slice';

export function useAdmin() {
  const dispatch = useDispatch();
  const { stats, users, logs, loading, error } = useSelector(state => state.admin);

  const fetchStats = useCallback(async () => {
    dispatch(setAdminLoading(true));
    try {
      const data = await adminService.getStats();
      dispatch(setAdminStats(data));
    } catch (err) {
      dispatch(setAdminError(err.message));
    }
  }, [dispatch]);

  const fetchUsers = useCallback(async () => {
    dispatch(setAdminLoading(true));
    try {
      const data = await adminService.getAllUsers();
      dispatch(setAdminUsers(data.users));
    } catch (err) {
      dispatch(setAdminError(err.message));
    }
  }, [dispatch]);

  const fetchLogs = useCallback(async () => {
    dispatch(setAdminLoading(true));
    try {
      const data = await adminService.getLogs();
      dispatch(setAdminLogs(data.logs));
    } catch (err) {
      dispatch(setAdminError(err.message));
    }
  }, [dispatch]);

  const changeRole = async (userId, role) => {
    try {
      const data = await adminService.updateRole(userId, role);
      dispatch(updateUserInList(data.user));
    } catch (err) {
       console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      dispatch(removeUserFromList(userId));
    } catch (err) {
      console.error(err);
    }
  };

  const assignTask = async (taskData) => {
    try {
      await adminService.assignTask(taskData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { 
    stats, users, logs, loading, error, 
    fetchStats, fetchUsers, fetchLogs, 
    changeRole, deleteUser, assignTask 
  };
}
