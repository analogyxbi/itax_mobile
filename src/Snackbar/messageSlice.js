// snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  message: '',
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.visible = true;
      state.message = action.payload;
    },
    hideSnackbar: (state) => {
      state.visible = false;
      state.message = '';
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
