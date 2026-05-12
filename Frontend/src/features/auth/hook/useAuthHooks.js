import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../service/auth.service';
import { setCredentials, logout, setLoading } from '../state/auth.slice';
import { clearAuthToken } from '../../../lib/api';

// General hook for handling async operations with loading and error states
const useAsync = (asyncFunction) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setIsLoading(false);
      return response;
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      throw new Error(message);
    }
  }, [asyncFunction]);

  return { execute, isLoading, error, setError };
};

export const useLogin = () => {
  const dispatch = useDispatch();
  const { execute, isLoading, error, setError } = useAsync(authService.loginUser);

  const login = async (data) => {
    const response = await execute(data);
    if (response.success && response.user) {
      dispatch(setCredentials({ user: response.user }));
    }
    return response;
  };

  return { login, isLoading, error, setError };
};

export const useRegister = () => {
  const { execute, isLoading, error, setError } = useAsync(authService.registerUser);
  return { register: execute, isLoading, error, setError };
};

export const useVerifyEmail = () => {
  const { execute, isLoading, error, setError } = useAsync(authService.verifyEmail);
  return { verifyEmail: execute, isLoading, error, setError };
};

export const useResendVerification = () => {
  const { execute, isLoading, error, setError } = useAsync(authService.resendVerification);
  return { resendVerification: execute, isLoading, error, setError };
};

export const useForgotPassword = () => {
  const { execute, isLoading, error, setError } = useAsync(authService.forgotPassword);
  return { forgotPassword: execute, isLoading, error, setError };
};

export const useResetPassword = () => {
  const { execute, isLoading, error, setError } = useAsync(authService.resetPassword);
  return { resetPassword: execute, isLoading, error, setError };
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const { execute, isLoading, error } = useAsync(authService.logoutUser);

  const performLogout = async () => {
    try {
      await execute();
    } finally {
      // Always clear local state even if server request fails
      dispatch(logout());
    }
  };

  return { performLogout, isLoading, error };
};

export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSelector((state) => state.auth);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.user) {
          dispatch(setCredentials({ user: response.user }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        clearAuthToken();
        dispatch(logout());
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  return { user, isAuthenticated, isLoading: isAuthLoading || isFetching };
};
