import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './loginscreen/reducers/reducers';
import thunk from 'redux-thunk';

export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
