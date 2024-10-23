import { createSlice } from '@reduxjs/toolkit';
import setupClient from '../setup/setupClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  csrf: null,
  url: null,
  user_data: null,
  companies: null,
  company: "NA",
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { csrf, url } = action.payload;
      state.csrf = csrf;
      state.url = url;
      setupClient(csrf, url);
      AsyncStorage.setItem('csrf', csrf);
      AsyncStorage.setItem('url', url);
    },
    logout: (state) => {
      state.csrf = null;
      state.url = null;
    },
    setUserData: (state, action) => {
      state.user_data = action.payload;
    },
    setCompanies: (state, action) => {
      state.companies = action.payload;
    },
    setCompany: (state, action) => {
      state.company = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { login, logout, setUserData, setCompanies, setCompany } = authSlice.actions;

export default authSlice.reducer;
