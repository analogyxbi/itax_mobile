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
