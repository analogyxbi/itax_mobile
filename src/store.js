import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './loginscreen/authSlice';
import snackbarReducer from './Snackbar/messageSlice';
import inventoryReducer from './inventory/reducer/inventory';
import poReceiptsReducer from './receiving/reducer/poReceipts';
import toastReducers from './components/Loaders/toastReducers';
import userReducer from './profile/userReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    inventory: inventoryReducer,
    poReceipts: poReceiptsReducer,
    toast: toastReducers,
    user: userReducer,
  },
});
export default store;
