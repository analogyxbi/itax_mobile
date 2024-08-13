import { AnalogyxBIClient } from "@analogyxbi/connection";

// Adjusted getBins function for server-side searching and pagination
export async function getBinsData(searchText, page, warehouse) {
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
  const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins?$select=WarehouseCode,BinNum&$filter=${combinedFilter}&$top=30`; // Adjust pagination logic
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
    const hasMore = bins.length >= 30; // Check if there might be more data to load

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