// snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  warehouses: [],
  isLoading: false,
  onSuccess: false,
  onError: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setWarehouses: (state, action) => {
      state.warehouses = action.payload;
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

export const { setWarehouses, setIsLoading, setOnSuccess, setOnError } =
  inventorySlice.actions;

export default inventorySlice.reducer;
