import { AnalogyxBIClient } from "@analogyxbi/connection";
import { setIsLoading, setOnError, setOnSuccess } from "../components/Loaders/toastReducers";
  // Function to convert from one UOM to another
  function convertQuantity(value, fromUOM, toUOM) {
    if (fromUOM === toUOM) return value;
    const fromConv = uomMap[fromUOM];
    const toConv = uomMap[toUOM];
    if (!fromConv || !toConv) {
      throw new Error('Conversion factor not found for the given UOM codes');
    }
    // Convert from 'fromUOM' to base UOM
    const valueInBaseUOM = value * fromConv.factor;
    // Convert from base UOM to 'toUOM'
    const result = valueInBaseUOM / toConv.factor;
    
    // Return the result rounded to two decimal places
    return result.toFixed(2);
  }
// Fetch initial data from API
export const createMassReceipts = async (epicor_endpoint, data, dispatch) => {
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint,
          request_type: 'POST',
          data: JSON.stringify(data),
        },
        stringify: false,
      });
  
      return response.json.data.parameters;

  };
  
  // Process the response data and send it to the next endpoint
  export const receiveAllLines = async (response, POData, packSLipNUm, dispatch) => {
      response.ipReceived = true;
      const modifiedResponse = {
        ...response,
        ds: {
          ...response.ds,
          RcvDtl: response.ds.RcvDtl.map(dt => ({
            ...dt,
            Selected: true,
            OurQty: dt.OrderQty - dt.PORelArrivedQty,
            InputOurQty: dt.OrderQty - dt.PORelArrivedQty,
            VendorQty: convertQuantity(dt.OrderQty, dt.IUM, dt.PUM),
            ReceivedComplete: true,
            ReceivedQty: dt.OrderQty - dt.PORelArrivedQty,
            Received: true,
            EnableSupplierXRef: false,
            EnableLot: false,
            PartNumTrackLots: false,
            PORelStatus: "C",
            LotNum: "0"
          })),
          RcvHead: response.ds.RcvHead.map(dt => ({
            ...dt,
            eshReceived: false,
            PartialReceipt: false,
          })),
        },
      };
  
      const epicor_endpoint = `/Erp.BO.ReceiptSvc/ReceiveAllLines`;
      const response2 = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint,
          request_type: 'POST',
          data: JSON.stringify(modifiedResponse),
        },
        stringify: false,
      });
  
      const commitPayload = response2.json.data.parameters;
      commitPayload.vendorNum = POData[0]?.VendorNum;
      commitPayload.purPoint = '';
      commitPayload.packSlip = packSLipNUm;
  
      return commitPayload;

  };
  
  // Commit the received data
  export const commitReceivedData = async (commitPayload, dispatch) => {

      const epicor_endpoint = `/Erp.BO.ReceiptSvc/CommitRcvDtl`;
      const response3 = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint,
          request_type: 'POST',
          data: JSON.stringify(commitPayload),
        },
        stringify: false,
      });

      return response3;
 
  };


  export const onChangeDTLPOSelected = async (commitPayload, dispatch) => {
    const epicor_endpoint = `/Erp.BO.ReceiptSvc/OnChangeDtlPOSelected`;
    const response3 = await AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify(commitPayload),
      },
      stringify: false,
    });
    return response3.json.data.parameters

};

export const closeRelease = async (commitPayload, dispatch) => {
  const epicor_endpoint = `/Erp.BO.POSvc/CloseRelease`;
  const response3 = await AnalogyxBIClient.post({
    endpoint: `/erp_woodland/resolve_api`,
    postPayload: {
      epicor_endpoint,
      request_type: 'POST',
      data: JSON.stringify(commitPayload),
    },
    stringify: false,
  });
  console.log({response3})
  return response3.json.data.parameters

};


export const getDoors = async (PONum)=>{
  console.log(PONum)
  const epicor_endpoint = `/BaqSvc/WD_DoorsAPI/?$filter=PORel_PONum eq ${PONum}`;
 try{
   const response = await AnalogyxBIClient.post({
     endpoint: `/erp_woodland/resolve_api`,
     postPayload: {
       epicor_endpoint,
       request_type: 'GET',
     },
     stringify: false,
   });
   return response?.json?.data?.value;
 }catch(err){
    console.log(err); 
    return [];
 }
}

export const saveJobDetails = async (data, keys, qty)=>{
  const base = 'http://wls-hq-fnet02/PurchasedPartsAPI.php?';
  let url = base + createQueryParamsWithCustomKeys(data, keys);
  url = url + `&ReceiptQty=${qty}`
  console.log("url", url)
  try{
    const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/external_call`,
        postPayload: {
          url
        },
        stringify: false,
      })
      const { json } = response;
  }catch(err){
    throw new Error(err);
  }
}

export const saveAllJobDetails = async (data, keys, PONum)=>{
  const base = 'http://wls-hq-fnet02/PurchasedPartsAPI.php?';
  const url = base + createQueryParamsWithCustomKeys(data, keys) + `&PONum=${PONum}`

  try{
    const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/external_call`,
        postPayload: {
          url
        },
        stringify: false,
      })
      const { json } = response;

  }catch(err){
    throw new Error(err);
  }
}

// Key mapping
const keyMap = {
  "JobHead_UserChar1": "GRP",
  "PORel_PONum": "PONum",
  "PORel_XRelQty": "Qty",
  "PODetail_PartNum": "PartNum",
  "PODetail_ClassID": "PartClass",
  "PORel_POLine": "LineNum",
  "PORel_PORelNum": "ReleaseNum",
  "PORel_JobNum": "JobNum",
  "PORel_ArrivedQty" : "ArrivedQty"
};
/**
 * Create a query string from an array of objects and specific keys with custom key mapping.
 * @param {Object[]} data - Array of objects containing the data.
 * @param {Object} keyMap - Object mapping original keys to custom keys.
 * @param {string[]} keys - Array of original keys to include in the query parameters.
 * @returns {string} - Query string with formatted parameters.
 */
function createQueryParamsWithCustomKeys(data, keys) {
  // Initialize an empty object to store query parameters
  const queryParams = {};

  // Iterate over each key
  keys.forEach(key => {
      // Determine the custom key to use
      const customKey = keyMap[key] || key; // Default to original key if no mapping is found
      if(customKey === 'ReceiptQty'){
            // Collect values for the current key
        const values = data
        .map(item => {
          if(item.PORel_XRelQty < item.PORel_ArrivedQty){
            return 0
          }else{
            return parseFloat(item.PORel_XRelQty) - parseFloat(item.PORel_ArrivedQty)
          }
        })
        .filter(value => value !== undefined && value !== null)
        .map(value => encodeURIComponent(value)) // Encode values for URL
        .join(';'); // Join values with a semicolon

        // If there are values for the key, add to queryParams with the custom key
        if (values) {
            queryParams[customKey] = values;
        }
      }else{
        // Collect values for the current key
        const values = data
            .map(item => item[key])
            .filter(value => value !== undefined && value !== null)
            .map(value => encodeURIComponent(value)) // Encode values for URL
            .join(';'); // Join values with a semicolon
  
        // If there are values for the key, add to queryParams with the custom key
        if (values) {
            queryParams[customKey] = values;
        }
      }
  });

  // Convert the queryParams object to a query string
  return new URLSearchParams(queryParams).toString();
}
