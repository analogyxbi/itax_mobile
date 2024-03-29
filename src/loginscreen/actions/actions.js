// import { createAsyncThunk } from '@reduxjs/toolkit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import setupClient from '../../setup/setupClient';
// import { login, logout } from '../reducers/reducers'; // Assuming the path to your authSlice is correct

// // Thunk for initializing the authentication state
// export const initAuth = createAsyncThunk(
//   'auth/init',
//   async (_, { dispatch }) => {
//     const csrf = await AsyncStorage.getItem('csrf');
//     if (csrf !== null) {
//       setupClient(csrf);
//       dispatch(login({ csrf }));
//     }
//   }
// );

// // Thunk for logging in
// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async ({ csrf, url }, { dispatch }) => {
//     setupClient(csrf);
//     dispatch(login({ csrf, url }));
//   }
// );

// // Thunk for logging out
// export const logoutUser = createAsyncThunk(
//   'auth/logout',
//   async (_, { dispatch }) => {
//     await AsyncStorage.clear();
//     dispatch(logout());
//   }
// );