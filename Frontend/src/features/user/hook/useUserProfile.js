import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../service/user.service';
import { logout } from '../../auth/state/auth.slice';
import { setProfile, setProfileLoading, setProfileError } from '../state/user.store';

export function useUserProfile() {
  const dispatch = useDispatch();
  const authUser = useSelector(s => s.auth.user);
  const { data: profile, loading, error } = useSelector(s => s.user.profile);

  const fetchProfile = useCallback(async () => {
    dispatch(setProfileLoading(true));
    try {
      const res = await userService.getMe();
      dispatch(setProfile(res.user));
    } catch (err) {
      dispatch(setProfileError(err.message));
    }
  }, [dispatch]);

  return { profile: profile || authUser, loading, error, fetchProfile };
}

export function useAppLogout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await userService.logout();
    } catch { /* server-side error is fine — still clear local state */ }
    dispatch(logout());
    localStorage.removeItem('fo-auth');
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  return { handleLogout };
}
