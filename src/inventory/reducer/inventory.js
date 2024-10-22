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
  currentCycle: {},
  cyclesData: [],
  selectedCycleDetails: [],
  tagsData: [],
  cycleTags: [],
  screen:'initial'
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
        cyclesData: [],
        selectedCycleDetails: [],
        tagsData: [],
        cycleTags: [],
      };
    },
    setScreenLayout:(state,action) =>{
      state.screen = action.payload;
    },
    setCurrentCycle: (state, action) => {
      state.currentCycle = action.payload;
    },
    setCyclesData: (state, action) => {
      state.cyclesData = action.payload;
    },
    setSelectedCycleDetails: (state, action) => {
      state.selectedCycleDetails = action.payload;
    },
    setSelectedCycleCCDtls: (state, action)=>{
      const CCDtls = action.payload
      state.selectedCycleDetails[0].CCDtls = CCDtls
    },
    setTagsData: (state, action) => {
      if (action.payload && Array.isArray(action.payload)) {
        const remainingTags = action.payload.filter(
          (tag) =>
            tag.TagReturned === false
        );
        state.tagsData = remainingTags;
      }
    },
    setCycleTags: (state, action) => {
      if (action.payload && Array.isArray(action.payload)) {
        state.cycleTags = action.payload;
      }
    },
    removeTag: (state, action) => {
      let tags = state.tagsData.filter((tag) => tag.TagNum != action.payload);
      state.tagsData = tags;
    },
    changeCurrentCycleStatus:(state, action)=>{
      state.currentCycle.CycleStatus = action.payload
    } 
  },
});

export const {
  setWarehouses,
  setWhseBins,
  clearBinData,
  setInitialState,
  setCurrentCycle,
  setCyclesData,
  setSelectedCycleDetails,
  setTagsData,
  removeTag,
  setCycleTags,
  setSelectedCycleCCDtls,
  setScreenLayout,
  changeCurrentCycleStatus
} = inventorySlice.actions;

export default inventorySlice.reducer;
