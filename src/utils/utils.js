import { AnalogyxBIClient } from "@analogyxbi/connection";


export const isEmpty = (obj) => Object.entries(obj).length === 0 && obj.constructor === Object;
// Adjusted getBins function for server-side searching and pagination
export async function getBinsData(searchText, page, warehouse, limit=100) {
//   setRefreshing(true);
  // Prepare filters
  const warehouseFilter = encodeURI(`WarehouseCode eq '${warehouse}'`);
  const inactiveFilter = encodeURI('InActive eq false');
  const searchFilter = encodeURI(`startswith(BinNum, '${searchText}')`);// Adjust based on how you want to search

  // Combine the filters using the `and` operator
  let combinedFilter = `${warehouseFilter} and ${inactiveFilter}`;
  if(searchText.length >0){
    combinedFilter = combinedFilter + ` and ${searchFilter}`
  }
  const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins?$select=WarehouseCode,BinNum&$filter=${combinedFilter}&$skip=${page * limit}&$top=${limit}`; // Adjust pagination logic
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
    const bins = json.data.value;
    const hasMore = bins.length >= limit; // Check if there might be more data to load

    return {
      data: bins,
      hasMore,
    };
  } catch (err) {
    console.error('Error fetching bins:', err);
    throw new Error('Error getting the list of bins');
  } finally {
    // setRefreshing(false);
  }
}



export async function getPartWhseInfo(searchText, page, warehouse) {
  //   setRefreshing(true);
    // Prepare filters
    let warehouseFilter = encodeURI(`WarehouseCode eq '${warehouse}'`);
    const onHandQtyFilter = encodeURI('OnHandQty gt 0'); // Changed to check for greater than 0
    const searchFilter = encodeURI(`startswith(PartNum, '${searchText}')`); // Adjust based on how you want to search
    
    // Combine the filters using the `and` operator
    if (searchText.length > 0) {
      warehouseFilter = warehouseFilter + ` and ${searchFilter}`;
    }
    
    // Combine all filters
    const combinedFilter = `${warehouseFilter} and ${onHandQtyFilter}`;
    
    // Construct the Epicor endpoint with pagination
    const epicor_endpoint = `/Erp.BO.PartWhseSearchSvc/PartWhseSearches?$select=WarehouseCode,PartNum,OnHandQty,Company,Plant&$filter=${combinedFilter}&$skip=${page * 100}&$top=100`;
    
    // Payload for the API request
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
      const part = json.data.value;
      const hasMore = part.length >= 100; // Check if there might be more data to load
  
      return {
        data: part,
        hasMore,
      };
    } catch (err) {
      console.error('Error fetching bins:', err);
      throw new Error('Error getting the list of bins');
    } finally {
      // setRefreshing(false);
    }
  }


export async function getPartDetails(searchText, page, warehouse) {
   
      const epicor_endpoint = `/Erp.BO.PartOnHandWhseSvc/GetPartOnHandWhse?$select=WarehouseCode,PartNum,OnHandQty,Company,Plant&$filter=${warehouseFilter}&$skip=${page * 100}&$top=100`; // Adjust pagination logic
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
        const part = json.data.value;
        const hasMore = part.length >= 100; // Check if there might be more data to load
    
        return {
          data: part,
          hasMore,
        };
      } catch (err) {
        console.error('Error fetching bins:', err);
        throw new Error('Error getting the list of bins');
      } finally {
        // setRefreshing(false);
      }
}





// /Erp.BO.PartBinSearchSvc/GetFullBinSearch
export async function fetchBinfromPartWhse(part, warehouse){
  const data = {
    "partNum": part,
    "whseCode": warehouse,
    "consolidateInvAttributes": true
  }
  const epicor_endpoint = `/Erp.BO.PartBinSearchSvc/GetFullBinSearch`; // Adjust pagination logic
  const postPayload = {
    epicor_endpoint,
    request_type: 'POST',
    data: JSON.stringify(data),
  };

  try {
    const response = await AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload,
      stringify: false,
    });

    const { json } = response;
    const part = json.data;
    return {
      data: part
    };
  } catch (err) {
    console.error('Error fetching bins:', err);
    throw new Error('Error getting the list of bins');
  } finally {
    // setRefreshing(false);
  }
}



function convertDate(timestamp){
// Convert timestamp to Date object
const date = new Date(timestamp * 1000);

// Format Date object to "DD-MM-YYYY"
const day = String(date.getDate()).padStart(2, '0');
const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}


export async function postJobMaterial(){
  // const epicor_endpoint = `/Erp.BO.PartBinSearchSvc/GetFullBinSearch`; // Adjust pagination logic
  // const postPayload = {
  //   epicor_endpoint,
  //   request_type: 'POST',
  //   data: JSON.stringify(data),
  // };

  // try {
  //   const response = await AnalogyxBIClient.post({
  //     endpoint: `/erp_woodland/resolve_api`,
  //     postPayload,
  //     stringify: false,
  //   });

  //   const { json } = response;
  //   const part = json.data;
  //   return {
  //     data: part
  //   };
  // } catch (err) {
  //   console.error('Error fetching bins:', err);
  //   throw new Error('Error getting the list of bins');
  // } finally {
  //   // setRefreshing(false);
  // }
}
