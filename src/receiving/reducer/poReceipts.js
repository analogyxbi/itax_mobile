// snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  podata: [],
  isLoading: false,
  onSuccess: false,
  onError: false,
};

const poReceiptsSlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setPOdataResponse: (state, action) => {
      state.podata = action.payload;
    },
  },
});

export const { setPOdataResponse } = poReceiptsSlice.actions;

export default poReceiptsSlice.reducer;
