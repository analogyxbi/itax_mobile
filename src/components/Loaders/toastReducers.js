// snackbarSlice.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  onSuccess: false,
  onError: false,
  message: '',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.message = action.payload.message;
      state.isLoading = action.payload.value;
    },
    setOnSuccess: (state, action) => {
      state.message = action.payload.message;
      state.onSuccess = action.payload.value;
    },
    setOnError: (state, action) => {
      state.message = action.payload.message;
      state.onError = action.payload.value;
    },
    clearMessage: (state, action) => {
      state.message = '';
      state.onError = false;
      state.onSuccess = false;
      state.isLoading = false;
    },
  },
});

export const { setIsLoading, setOnSuccess, setOnError, clearMessage } =
  toastSlice.actions;

export default toastSlice.reducer;
