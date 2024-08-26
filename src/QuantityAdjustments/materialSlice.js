// snackbarSlice.js
import { AnalogyxBIClient } from "@analogyxbi/connection";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  globalReasons: [],
  loading: false,
  getNewPartNum:{}
};

export const fetchGlobalReasons = createAsyncThunk(
  "materials/fetchGlobalReasons",
  async () => {
    const epicor_endpoint = `/Erp.BO.ReasonSvc/List?$select=Company,ReasonType,ReasonCode,Description`;
    const postPayload = {
        epicor_endpoint,
        request_type: 'GET',
    };
    try {
        const response = await AnalogyxBIClient.post({
            endpoint: `/erp_woodland/resolve_api`,
            postPayload,
            stringify: false,
        });
        const { json } = response;
        return json.data.value;

    } catch (err) {
        console.error(`Error fetching Reasons:`, err);
        throw err; // Rethrow the error to handle it at the call site if needed
    }
  }
);

export const callIssueReturnGetNewPartNum = createAsyncThunk(
  "materials/callIssueReturnGetNewPartNum",
  async (partnum) => {
   const payload = {
      "pcPartNum": partnum,
      "pcTranType": "STK-UKN",
      "pcMtlQueueRowID": "00000000-0000-0000-0000-000000000000",
      "ds":{}
    }
    const postPayload = {
      epicor_endpoint: `/Erp.BO.IssueReturnSvc/GetNewPartNum`,
      request_type: "POST",
      data: JSON.stringify(payload),
    };
    try {
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      });
      const {json} = response
      const returns = json.data.parameters.ds.IssueReturn
      // dispatch(setOnSuccess({ value: true, message: 'Quantity Adjusted' }))
      return {ds: {IssueReturn:returns}};
    } catch (err) {
      err.json().then((errData)=> console.log({errData})).catch((error)=> console.log(error))
      throw err; // Rethrow the error to handle it at the call site if needed
    }
  }
);

const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    setGlobalReasons: (state, action) => {
      state.globalReasons = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalReasons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalReasons.fulfilled, (state, action) => {
        state.loading = false;
        state.globalReasons = action.payload;
      })
      .addCase(fetchGlobalReasons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(callIssueReturnGetNewPartNum.pending, (state) => {
        state.loading = true;
      })
      .addCase(callIssueReturnGetNewPartNum.fulfilled, (state, action) => {
        state.getNewPartNum = action.payload;
        state.loading =  false;
      })
      .addCase(callIssueReturnGetNewPartNum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export const { setGlobalReasons } = materialSlice.actions;

export default materialSlice.reducer;
