import { createSlice } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  csrf: null,
  url: null,
};

// Create auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { csrf, url } = action.payload;
      state.csrf = csrf;
      state.url = url;
    },
    logout(state) {
      state.csrf = null;
      state.url = null;
    },
  },
});

// Export actions
export const { login, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;