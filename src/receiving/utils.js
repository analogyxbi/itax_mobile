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
    console.log({epicor_endpoint, data})
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint,
          request_type: 'POST',
          data: JSON.stringify(data),
        },
        stringify: false,
      });
  
      console.log("1st res", response.json);
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
            LotNum: "0"
          })),
          RcvHead: response.ds.RcvHead.map(dt => ({
            ...dt,
            eshReceived: false,
            PartialReceipt: false,
          })),
        },
      };
  
      console.log("2nd payload", modifiedResponse);
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
  
      console.log("3rd payload", commitPayload);
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

export const getDoors = async (data, po)=>{
  console.log("selectedPo", data, po)
  const epicor_endpoint = `/BaqSvc/WD_DoorsAPI/?$filter=PODetail_ClassID eq '${data?.ClassID}' and PODetail_PartNum eq '${data?.PartNum}' and PORel_POLine eq ${data?.POLine} and PORel_PONum eq ${data?.PONUM} and PORel_JobSeq eq ${po?.JobSeq} and PORel_JobNum eq '${po?.JobNum}'`;
    const response = await AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'GET',
      },
      stringify: false,
    });
    return response?.json?.data?.value;
}

export const saveJobDetails = async (data, keys)=>{
  const base = 'http://wls-hq-fnet02/PurchasedPartsAPI.php?';
  const url = base + createQueryParamsWithCustomKeys(data, keys)

  console.log("modified_url",url)
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
  });

  // Convert the queryParams object to a query string
  return new URLSearchParams(queryParams).toString();
}
