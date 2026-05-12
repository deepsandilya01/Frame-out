import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  users: [],
  logs: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminLoading: (state, action) => { state.loading = action.payload; },
    setAdminStats:   (state, action) => { state.stats = action.payload; state.loading = false; },
    setAdminUsers:   (state, action) => { state.users = action.payload; state.loading = false; },
    setAdminLogs:    (state, action) => { state.logs = action.payload; state.loading = false; },
    updateUserInList:(state, action) => {
      const idx = state.users.findIndex(u => u._id === action.payload._id);
      if (idx !== -1) state.users[idx] = action.payload;
    },
    removeUserFromList: (state, action) => {
      state.users = state.users.filter(u => u._id !== action.payload);
    },
    setAdminError:   (state, action) => { state.error = action.payload; state.loading = false; },
  }
});

export const { 
  setAdminLoading, setAdminStats, setAdminUsers, setAdminLogs,
  updateUserInList, removeUserFromList, setAdminError 
} = adminSlice.actions;

export default adminSlice.reducer;
