import { AnalogyxBIClient } from "@analogyxbi/connection";
import { setOnError, setOnSuccess } from "../../components/Loaders/toastReducers";
import { setSelectedCycleCCDtls, setSelectedCycleDetails } from "../reducer/inventory";

export const generateTags = {
  ds: {
    CCHdr: [
      {
        Company: 'WOOD01',
        WarehouseCode: 'string',
        Plant: 'MfgSys',
        CCYear: 0,
        CCMonth: 0,
        FullPhysical: true,
        CycleSeq: 0,
        CycleDate: '2024-05-31T06:58:37.584Z',
        CycleStatus: 0,
        TagGenDate: '2024-05-31T06:58:37.584Z',
        SeqStartDate: '2024-05-31T06:58:37.584Z',
        AdjustPosted: true,
        NestedPCID: true,
        CancelPI: true,
        EnablePrintTags: true,
        EnableReprintTags: true,
        EnableStartCountSeq: true,
        EnableVoidBlankTags: true,
        EnableVoidTagsByPart: true,
        NumOfBlankTags: 0, // No of tags
        PostTransDate: '2024-05-31T06:58:37.584Z',
        RemoveAllParts: true,
        TagSortOption: 0,
        BlankTagsOnly: true,
        NumOfBlankPCIDTags: 0,
        BitFlag: 0,
      },
    ],
    CCDtl: [
      {
        Company: 'WOOD01',
        WarehouseCode: 'string',
        Plant: 'MfgSys',
        CCYear: 0,
        CCMonth: 0,
        FullPhysical: true,
        AllocationVariance: true,
        CycleSeq: 0,
        QtyToleranceUsed: true,
        PcntToleranceUsed: true,
        ValToleranceUsed: true,
        AddedByBlankTag: true,
        ABCSeq: 0,
        VoidPartTags: true,
        EnableCDRCode: true,
        MovePart: true,
        QtyVariance: '0',
        ValueVariance: '0',
        MovedToMonth: 0,
        MovedToYear: 0,
        MovedToCycleSeq: 0,
      },
    ],
  },
};

export function validateVariable(variable) {
  // Check if variable is null or undefined
  if (variable === null || variable === undefined) {
    return true; // Variable is null or undefined, return true
  }

  // Check if variable is an object and has at least one key
  if (typeof variable === 'object' && Object.keys(variable).length > 0) {
    return false; // Object with at least one key, return false
  }

  // In all other cases, return true
  return true;
}

export function createDsPayload(cycle, part) {
  let data = {
    ds: {
      CCHdr: [
        {
          ...cycle,
        },
      ],
      CCDtl: [
        {
          Company: cycle.Company,
          WarehouseCode: cycle.WarehouseCode,
          Plant: cycle.Plant,
          CCYear: cycle.CCYear,
          CCMonth: cycle.CCMonth,
          FullPhysical: cycle.FullPhysical,
          CycleSeq: cycle.CycleSeq,
          PartNum: part,
          RowMod: 'A',
        },
      ],
    },
    plant: cycle.Plant,
    warehouseCode: cycle.WarehouseCode,
    ccYear: cycle.CCYear,
    ccMonth: cycle.CCMonth,
    fullPhysical: cycle.FullPhysical,
    cycleSeq: cycle.CycleSeq,
  };
  return data;
}


async function createMultiPartPayload(cycle, part) {
  const partData = part.map((data) => ({
    Company: cycle.Company,
    WarehouseCode: cycle.WarehouseCode,
    Plant: cycle.Plant,
    CCYear: cycle.CCYear,
    CCMonth: cycle.CCMonth,
    FullPhysical: cycle.FullPhysical,
    CycleSeq: cycle.CycleSeq,
    PartNum: data.PartNum,
    TotFrozenQOH: data.QtyOnHand,
    TotFrozenVal:data.QtyOnHand,
    RowMod: 'A',
  }));
  
  const data = {
    ds: {
      CCHdr: [
        {
          ...cycle,
        },
      ],
      CCDtl: [...partData],
    },
    plant: cycle.Plant,
    warehouseCode: cycle.WarehouseCode,
    ccYear: cycle.CCYear,
    ccMonth: cycle.CCMonth,
    fullPhysical: cycle.FullPhysical,
    cycleSeq: cycle.CycleSeq,
  };

  return data;
}

export function updatePartToDataset(dataset, part) {
  let data = dataset.ds;
  let ccdetails = data.CCDtl;
  let dtl = [];
  ccdetails.forEach((dtls) => {
    let newDtls = dtls;
    if (dtls.PartNum === part) {
      dtl.push({ ...newDtls, BaseUOM: newDtls.PartNumIUM });
    }
  });
  data.CCDtl = dtl;
  return { ds: data };
}


export async function fetchPartByWhseBin(whse, bin, select="PartNum") {
  const data = {
      whseCode: whse,
      binNum: bin,
  };

  const epicor_endpoint = `/Erp.BO.PartBinSearchSvc/GetBinContents?$select=${select}`;
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
      const part = response.json.data.returnObj.PartBinSearch;
      return part;

  } catch (err) {
      console.error(`Error fetching Parts for warehouse ${data.whseCode} and bin ${data.binNum}:`, err);
      throw err; // Optionally rethrow to handle it where this function is called
  }
}


export async function addPartsDetailsToCycle(cycle, part, dispatch) {
  const payload = await createMultiPartPayload(cycle, part);
  const epicor_endpoint = '/Erp.BO.CCPartSelectUpdSvc/GetNewCCDtl';
  const data = payload

  try {
    const response = await AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify(data),
      },
      stringify: false,
    });

    const { json } = response;
    // Assuming updateCCDtls needs to be awaited to complete before the function resolves
    const res  = await updateMultiCCDtls(json.data.parameters, part, dispatch);
    return res
  } catch (err) {
    console.error(err)
    try {
      const errorResponse = await err.json();
      dispatch(setOnError({ value: true, message: errorResponse.ErrorMessage }));
    } catch (error) {
      dispatch(setOnError({ value: true, message: 'An Error Occurred' }));
    }
  }
}

async function updateMultiCCDtls(dataset, part, dispatch) {
  const data = updateMultiPartToDataset(dataset, part);
  const epicor_endpoint = '/Erp.BO.CCPartSelectUpdSvc/Update';
  try {
    const response = await AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify(data),
      },
      stringify: false,
    });
    
    const { json } = response;
    dispatch(setSelectedCycleCCDtls(json.data.parameters.ds.CCDtl))
    dispatch(setOnSuccess({ value: true, message: "Parts Added to the Cycle." }));
    return "json"
    
    // dispatch(setSelectedCycleDetails)
  } catch (err) {
    console.error(err)
    try {
      const errorResponse = await err.json();
      dispatch(setOnError({ value: true, message: errorResponse.ErrorMessage }));
    } catch (error) {
      dispatch(setOnError({ value: true, message: 'An Error Occurred' }));
    }
  }
}


export function updateMultiPartToDataset(dataset, part) {
  let data = dataset.ds;
  let ccdetails = data.CCDtl;
  let dtl = [];
  ccdetails.forEach((dtls) => {
    let newDtls = dtls;
    let foundData = part.find((data) => data.PartNum === dtls.PartNum)
    if(foundData){
      dtl.push({ ...newDtls, BaseUOM: foundData.IUM });
    }
  });
  return { ds: {...data, CCDtl: dtl} };
}


export async function fetchCountPartDetails(part, plant="MfgSys", warehouseCode) {
  if(part && warehouseCode){
    const data =    {
      "cPartNum": part,
      "cPlant": plant
    }
    const epicor_endpoint = `/Erp.BO.PartOnHandWhseSvc/GetPartOnHandWhse`;
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
        const onHandbinsArray = json.data.returnObj.PartOnHandBin;
        const found = onHandbinsArray.find((data) => data.WarehouseCode === warehouseCode)
        if(found){
          return {...found, PrimaryBinNum:found.BinNum, IUM: found.UnitOfMeasure }
        }else{
          return {
            PartNum: part
          }
        }
  
    } catch (err) {
        console.error(`Error fetching Parts for warehouse ${data.whseCode} and bin ${data.binNum}:`, err);
        throw err; // Optionally rethrow to handle it where this function is called
    }
  }
}