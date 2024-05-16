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
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setOnSuccess: (state, action) => {
      state.onSuccess = action.payload;
    },
    setOnError: (state, action) => {
      state.onError = action.payload;
    },
  },
});

export const { setPOdataResponse, setIsLoading, setOnSuccess, setOnError } =
  poReceiptsSlice.actions;

export default poReceiptsSlice.reducer;
