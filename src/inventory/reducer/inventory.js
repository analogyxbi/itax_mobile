// snackbarSlice.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit';

const existWarehouses = AsyncStorage.getItem('warehouses');
let warehouses = [];
if (existWarehouses) {
  try {
    warehouses = JSON.parse(existWarehouses);
  } catch (err) {
    console.log({ err });
  }
}

const bins = AsyncStorage.getItem('binsData');
let binsData = {};
if (bins) {
  try {
    binsData = JSON.parse(bins);
  } catch (err) {
    console.log({ err });
  }
}

const initialState = {
  warehouses,
  isLoading: false,
  onSuccess: false,
  onError: false,
  binsData,
  message: '',
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setWarehouses: (state, action) => {
      AsyncStorage.setItem('warehouses', JSON.stringify(action.payload));
      state.warehouses = action.payload;
    },
    setWhseBins: (state, action) => {
      const { warehouse, bins } = action.payload;
      let existingBin = Object.assign({}, state.binsData);
      existingBin[warehouse] = bins;
      state.binsData = existingBin;
      AsyncStorage.setItem('binsData', JSON.stringify(existingBin));
    },
    clearBinData: (state) => {
      state.binsData = {};
      AsyncStorage.setItem('binsData', JSON.stringify({}));
    },
    setInitialState: (state) => {
      AsyncStorage.setItem('binsData', JSON.stringify({}));
      AsyncStorage.setItem('warehouses', JSON.stringify([]));
      state = {
        warehouses: [],
        isLoading: false,
        onSuccess: false,
        onError: false,
        binsData: [],
      };
    },
  },
});

export const { setWarehouses, setWhseBins, clearBinData, setInitialState } =
  inventorySlice.actions;

export default inventorySlice.reducer;
