import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './loginscreen/authSlice';
import thunk from 'redux-thunk';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
export default store;