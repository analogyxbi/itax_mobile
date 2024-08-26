// snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalReasons: []
};

const materialSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setGlobalReasons: (state, action) => {
      state.globalReasons = action.payload;
    },
  },
});

export const { setGlobalReasons } = materialSlice.actions;

export default materialSlice.reducer;
