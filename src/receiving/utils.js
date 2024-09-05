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

export const saveJobDetails = async (data)=>{
  const base = 'http://wls-hq-fnet02/PurchasedPartsAPI.php?Grp=PBJB_19767_WICKES;PBJB_19766_WICKES'
  const response = await AnalogyxBIClient.post({
    endpoint: `/erp_woodland/external_call`,
    postPayload: {
      url: '',
    },
    stringify: false,
  });

  return response?.json;
}



/**
 * Create a query string from an array of objects and specific keys with custom key mapping.
 * @param {Object[]} data - Array of objects containing the data.
 * @param {Object} keyMap - Object mapping original keys to custom keys.
 * @param {string[]} keys - Array of original keys to include in the query parameters.
 * @returns {string} - Query string with formatted parameters.
 */
function createQueryParamsWithCustomKeys(data, keyMap, keys) {
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


const data = [
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 1,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_137",
    "PORel_JobNum": "100010",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 40,
    "PORel_XRelQty": "13.00000000",
    "PODetail_PartNum": "AW180X600",
    "PODetail_ClassID": "030",
    "RowIdent": "9fa580d5-d802-4f74-9b0c-de4a1d7f8191"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 2,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100008",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 20,
    "PORel_XRelQty": "10.00000000",
    "PODetail_PartNum": "AW396X600",
    "PODetail_ClassID": "030",
    "RowIdent": "2ec21f0f-39e1-483a-be21-5f76d42e9a7a"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 3,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100008",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 30,
    "PORel_XRelQty": "10.00000000",
    "PODetail_PartNum": "AW405X600",
    "PODetail_ClassID": "030",
    "RowIdent": "dcdb0e81-9102-42d8-8bb2-a84c9b5b1bab"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 4,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_137",
    "PORel_JobNum": "100010",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 50,
    "PORel_XRelQty": "26.00000000",
    "PODetail_PartNum": "AW621X296",
    "PODetail_ClassID": "030",
    "RowIdent": "c390447c-6e1c-4430-92c2-4c9f9a15c771"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 5,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_137",
    "PORel_JobNum": "100009",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 40,
    "PORel_XRelQty": "30.00000000",
    "PODetail_PartNum": "AW697X296",
    "PODetail_ClassID": "030",
    "RowIdent": "1e3bc339-4711-41f4-9862-d685417937d2"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 6,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_137",
    "PORel_JobNum": "100009",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 50,
    "PORel_XRelQty": "30.00000000",
    "PODetail_PartNum": "AW715X430",
    "PODetail_ClassID": "030",
    "RowIdent": "cb2c4ed0-baf8-462c-a8ae-7ce9e8d4fb03"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 7,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100007",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 10,
    "PORel_XRelQty": "5.00000000",
    "PODetail_PartNum": "AW803X300",
    "PODetail_ClassID": "030",
    "RowIdent": "d08d5167-a526-443f-a02c-0d416323358a"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 8,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100008",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 40,
    "PORel_XRelQty": "20.00000000",
    "PODetail_PartNum": "AW820X285",
    "PODetail_ClassID": "030",
    "RowIdent": "64f028d7-9ac3-41f1-a6e3-80d0cb523752"
  },
  {
    "PORel_PONum": 1533,
    "PORel_POLine": 8,
    "PORel_PORelNum": 2,
    "JobHead_UserChar1": "201905_137",
    "PORel_JobNum": "100010",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "26.00000000",
    "PODetail_PartNum": "AW820X285",
    "PODetail_ClassID": "030",
    "RowIdent": "805eaa14-dd53-48b0-9fea-97102310c432"
  },
  {
    "PORel_PONum": 1534,
    "PORel_POLine": 1,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100020",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 40,
    "PORel_XRelQty": "7.00000000",
    "PODetail_PartNum": "SMPAVGDRV565X597",
    "PODetail_ClassID": "030",
    "RowIdent": "b3a6fa2c-a78b-47c0-af4d-7be90dad46a0"
  },
  {
    "PORel_PONum": 1534,
    "PORel_POLine": 2,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100020",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 50,
    "PORel_XRelQty": "7.00000000",
    "PODetail_PartNum": "SMPAVGDWH245X601",
    "PODetail_ClassID": "030",
    "RowIdent": "f01fdd05-3db2-4edd-8f64-abede5362f37"
  },
  {
    "PORel_PONum": 1534,
    "PORel_POLine": 3,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100020",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "7.00000000",
    "PODetail_PartNum": "SMPAVGDWH280X597",
    "PODetail_ClassID": "030",
    "RowIdent": "713f40d9-f222-4245-8638-84fef7da1bb4"
  },
  {
    "PORel_PONum": 1535,
    "PORel_POLine": 1,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100015",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "8.00000000",
    "PODetail_PartNum": "VMTAVGDR1V455X297",
    "PODetail_ClassID": "030",
    "RowIdent": "f4705860-5da1-4a96-b470-c8396ef4f40b"
  },
  {
    "PORel_PONum": 1535,
    "PORel_POLine": 2,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100015",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 70,
    "PORel_XRelQty": "8.00000000",
    "PODetail_PartNum": "VMTAVGDRFV455X297",
    "PODetail_ClassID": "030",
    "RowIdent": "56e80ee4-3b24-4114-aa91-4350dfefc742"
  },
  {
    "PORel_PONum": 1535,
    "PORel_POLine": 3,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_139",
    "PORel_JobNum": "100015",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 80,
    "PORel_XRelQty": "8.00000000",
    "PODetail_PartNum": "VMTAVGTDWH245X597",
    "PODetail_ClassID": "030",
    "RowIdent": "8b67254b-d3cb-449d-9041-fb6bbcff0630"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 1,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100017",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "10.00000000",
    "PODetail_PartNum": "VMTGANBDWH245X597",
    "PODetail_ClassID": "030",
    "RowIdent": "52822933-d4ec-4bcd-8339-7bcc304ed742"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 2,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100018",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "4.00000000",
    "PODetail_PartNum": "VMTGANBDWH245X797",
    "PODetail_ClassID": "030",
    "RowIdent": "fe461364-7027-4e97-8605-42594ea89747"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 3,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100013",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "6.00000000",
    "PODetail_PartNum": "VMTGANDR1V455X397",
    "PODetail_ClassID": "030",
    "RowIdent": "d684e424-bcf2-4e9a-a868-0e59af0369af"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 4,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100016",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "5.00000000",
    "PODetail_PartNum": "VMTGANDR3V1245X397",
    "PODetail_ClassID": "030",
    "RowIdent": "632ae286-2ddc-4b2e-a597-028e03d80d3d"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 5,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100013",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 70,
    "PORel_XRelQty": "6.00000000",
    "PODetail_PartNum": "VMTGANDRFV455X397",
    "PODetail_ClassID": "030",
    "RowIdent": "53cbb1cf-ffe0-4af6-a45b-4e04da2a820c"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 6,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "",
    "PORel_JobNum": "100016",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 70,
    "PORel_XRelQty": "5.00000000",
    "PODetail_PartNum": "VMTGANTDWH245X397",
    "PODetail_ClassID": "030",
    "RowIdent": "3e9c4265-961d-45b4-9fe5-23aa1f0201cf"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 7,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100017",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 70,
    "PORel_XRelQty": "10.00000000",
    "PODetail_PartNum": "VMTGANTDWH245X597",
    "PODetail_ClassID": "030",
    "RowIdent": "9eb4bf4c-79ce-443c-a60c-960c63458352"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 8,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100013",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 80,
    "PORel_XRelQty": "6.00000000",
    "PODetail_PartNum": "VMTGANTDWH245X797",
    "PODetail_ClassID": "030",
    "RowIdent": "f1628439-26a6-4408-b454-6877beb61fc9"
  },
  {
    "PORel_PONum": 1536,
    "PORel_POLine": 8,
    "PORel_PORelNum": 2,
    "JobHead_UserChar1": "201905_138",
    "PORel_JobNum": "100018",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 70,
    "PORel_XRelQty": "4.00000000",
    "PODetail_PartNum": "VMTGANTDWH245X797",
    "PODetail_ClassID": "030",
    "RowIdent": "efcbfc3b-fa8d-44a6-a477-7d8d35533d64"
  },
  {
    "PORel_PONum": 1537,
    "PORel_POLine": 1,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_140",
    "PORel_JobNum": "100019",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "12.00000000",
    "PODetail_PartNum": "VMTGWTBDWH245X597",
    "PODetail_ClassID": "030",
    "RowIdent": "3fd1a494-ec77-4a03-a649-3ac20cdb1a7a"
  },
  {
    "PORel_PONum": 1537,
    "PORel_POLine": 2,
    "PORel_PORelNum": 1,
    "JobHead_UserChar1": "201905_140",
    "PORel_JobNum": "100014",
    "PORel_AssemblySeq": 0,
    "PORel_JobSeq": 60,
    "PORel_XRelQty": "4.00000000",
    "PODetail_PartNum": "VMTGWTDR1V455X397",
    "PODetail_ClassID": "030",
    "RowIdent": "f298f4ab-72de-4778-9aa6-ba967b89850f"
  }
]

console.log(createQueryParamsWithCustomKeys(data,keyMap,["JobHead_UserChar1", 'PORel_PONum','PODetail_PartNum','PORel_POLine']))