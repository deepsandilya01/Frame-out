import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/auth.slice';
import userReducer from '../features/user/state/user.store';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});
