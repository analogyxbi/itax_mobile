import { AnalogyxBIClient } from "@analogyxbi/connection";

export async function fetchPartDetailsApi(part, plant = "MfgSys") {
    if (!part) {
        console.error("Part number is required.");
        return null;
    }
    const data = {
        "cPartNum": part,
        "cPlant": plant
    };
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
        return json;

    } catch (err) {
        console.error(`Error fetching parts for part number ${part} and plant ${plant}:`, err);
        throw err; // Rethrow the error to handle it at the call site if needed
    }
}

export async function fetchOnePartDetailsApi(part) {
    if (!part) {
        console.error("Part number is required.");
        return null;
    }
    const epicor_endpoint = `/Erp.BO.PartSvc/Parts?$filter=PartNum eq '${part}'`;

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
        return json;

    } catch (err) {
        console.error(`Error fetching part for part number ${part}:`, err);
        throw err; // Rethrow the error to handle it at the call site if needed
    }
}

export async function fetchReasons() {
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
        return json;

    } catch (err) {
        console.error(`Error fetching Reasons:`, err);
        throw err; // Rethrow the error to handle it at the call site if needed
    }
}