import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './loginscreen/authSlice';
import snackbarReducer from './Snackbar/messageSlice';
import inventoryReducer from './inventory/reducer/inventory';

const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    inventory: inventoryReducer,
  },
});
export default store;
