import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './loginscreen/authSlice';
import snackbarReducer from './Snackbar/messageSlice';
import inventoryReducer from './inventory/reducer/inventory';
import poReceiptsReducer from './receiving/reducer/poReceipts';
import toastReducers from './components/Loaders/toastReducers';

const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    inventory: inventoryReducer,
    poReceipts: poReceiptsReducer,
    toast: toastReducers,
  },
});
export default store;
