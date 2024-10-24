import { AnalogyxBIClient } from '@analogyxbi/connection';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';
import { globalStyles } from '../style/globalStyles';
import { setIsLoading } from './Loaders/toastReducers';
import { getReportParameters } from '../inventory/Utils/InventoryUtils';

function parseAndFormatFloat(floatString, decimalPlaces) {
  // Parse the float from the string
  let parsedFloat = parseFloat(floatString);

  // Check if the parsing was successful
  if (isNaN(parsedFloat)) {
    return ''; // or you can return an error message or some default value
  }

  // Format the float to the specified number of decimal places
  let formattedFloat = parsedFloat.toFixed(decimalPlaces);

  return formattedFloat;
}

function formatDate(date) {
  let day = String(date.getDate()).padStart(2, '0');
  let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  let year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatTime(date) {
  let hours = String(date.getHours()).padStart(2, '0');
  let minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function VarianceReport() {
  const [reportData, setReportData] = useState({});
  const { cycleTags, currentCycle, selectedCycleDetails } = useSelector((state) => state.inventory);
  const dispatch = useDispatch();

  const fetchReportData = async () => {
    if (currentCycle != {}) {
      dispatch(setIsLoading({ value: true, message: 'Fetching Report Data...' }));
      await getReportParameters(currentCycle)
      const filters = encodeURI(
        `(CCTag_WarehouseCode eq '${currentCycle.WarehouseCode}' and CCTag_CycleSeq eq ${currentCycle.CycleSeq} and CCTag_CCYear eq ${currentCycle.CCYear} and CCTag_CCMonth eq ${currentCycle.CCMonth})`
      );
      let endpoint = `/BaqSvc/CCReport?$filter=${filters}&top=10000`;
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint: endpoint,
          request_type: 'GET',
        },
        stringify: false,
      })
        .then(async ({ json }) => {
          setReportData(json.data.value)
          printToFile(json.data.value)
          dispatch(setIsLoading({ value: false, message: '' }));
        }).catch((err) => {
          // console.log({err: err.json()})
          dispatch(setIsLoading({ value: false, message: '' }));
          err.json().then((errRes)=>{
            dispatch(
              showSnackbar(errRes.ErrorMessage)
            );
          })
         
        });
    }
  }

  const printToFile = async (data) => {
    const htmlContent = createDynamicTable(data);
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      dispatch(showSnackbar('Error printing to file:', error));
    }
  };

  const createDynamicTable = (reportData) => {
    // Generating table rows dynamically
    let now = new Date();
    const tableRows = reportData
      .filter((data) => data?.CCTag_PartNum?.length > 0)
      .map(
        (item, index) =>
          `<tr key=${index}>
        <td>${item.CCTag_PartNum}</td>
        <td>${item.CCTag_TagNum}</td>
        <td>${item.CCTag_BinNum}</td>
        <td>${item.CCTag_UOM}</td>
        <td class="align-right">${parseAndFormatFloat(item.CCTag_CountedQty, 2)}</td>
        <td class="align-right">${parseAndFormatFloat(item.Calculated_Onhand, 2)}</td>
        <td class="align-right">${parseAndFormatFloat(item.Calculated_ADJQTY, 2)}</td>
        <td class="align-right">${parseAndFormatFloat(item.Calculated_ADJCOST, 2)}</td>
      </tr>`
      )
      .join('');
    // console.log(tableRows);
    if (tableRows.length === 0) {
      return dispatch(showSnackbar('No Rows Found in tag with Tag Number'));
    }
    // Calculate totals
    const totals = {
      snapTotal: reportData
        .filter((data) => data.CCTag_PartNum.length > 0)
        .reduce((acc, item) => acc + parseFloat(item.FrozenQOH), 0),
      countTotal: reportData
        .filter((data) => data.CCTag_PartNum.length > 0)
        .reduce((acc, item) => acc + parseInt(item.CCTag_CountedQty), 0),
      inhandTotal: reportData
        .filter((data) => data.CCTag_PartNum.length > 0)
        .reduce((acc, item) => acc + parseInt(item.Calculated_Onhand), 0),
      adjQtyTotal: reportData
        .filter((data) => data.CCTag_PartNum.length > 0)
        .reduce((acc, item) => acc + parseInt(item.Calculated_ADJQTY), 0),
      adjValTotal: reportData
        .filter((data) => data.CCTag_PartNum.length > 0)
        .reduce((acc, item) => acc + parseFloat(item.Calculated_ADJCOST), 0),

      // marTotal: cycleTags.reduce((acc, item) => acc + item.mar, 0),
    };

    const footer = `
    <tr class="bold-row">
      <td colspan="4">Totals:</td>
      <td class="align-right">${parseAndFormatFloat(totals.countTotal, 2)} </td>
      <td class="align-right">${parseAndFormatFloat(totals.inhandTotal, 2)} </td>
      <td class="align-right">${parseAndFormatFloat(totals.adjQtyTotal, 2)}</td>
      <td class="align-right">${parseAndFormatFloat(totals.adjValTotal, 2)}</td>
    </tr>
  `;
    // console.log('BEfore HTML');
    // HTML template for the entire document

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detail Count Variance Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          counter-reset: pageNumber; /* Initialize counter */
        }
         .footer {
          width: 100%;
          position: fixed;
          text-align: center;
        }
          .header{
          width: 100%;
          text-align: center;
          display:flex;
          justify-content:space-between;
          align-items:center
          },

        .header-left, .header-right, .header-center {
          margin: 0;
        }
        .header-center {
          text-align: center;
        }
        .bold-row {
          font-weight: bold;
        }
        .report-title {
          text-align: center;
          font-weight: bold;
        }
        .page-number::after {
          content: "Page " counter(pageNumber);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid black;
          padding: 5px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .align-right {
          text-align: right;
        }
        .align-center {
          text-align: center;
        }
        .yes {
          color: green;
        }
        .no {
          color: red;
        }
        @page {
          margin: 10px; /* Adjust margin to fit header and footer */
        }
        @media print {
          .footer {
            position: fixed;
          }
          .header {
            top: 0;
            left: 0;
            right: 0;
            text-align: center;
          }
          .footer {
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            counter-increment: pageNumber;
          }
        }
      </style>
    </head>
    <body>
    
    <div class="footer">
      <span class="page-number"></span>
    </div>
    
    <table>
      <thead>
        <tr>
          <th colspan="13">
            <div class="header">
              <div class="header-left">
                <p>User<br>Analogyx App</p>
              </div>
              <div class="header-center">
                <h2 class="report-title">Woodland Kitchens NI Ltd<br>Detail Count Variance Report</h2>
                <p>Whs: ${currentCycle.WarehouseCode} ;&nbsp;&nbsp;&nbsp;Per: ${currentCycle.CCHdrWarehseDescription
      } &nbsp;&nbsp;&nbsp;&nbsp;Yr:${currentCycle.CCYear
      } &nbsp;&nbsp;&nbsp;&nbsp;Cycle:${currentCycle.CycleSeq} </p>
              </div>
              <div class="header-right">
                <p>Time: ${formatTime(now)} <br>Date: ${formatDate(now)}</p>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>Part</th>
          <th>Tag</th>
          <th>Bin</th>
          <th>UOM</th>
          <th>Counted</th>
          <th>On hand Qty</th>
          <th>Adj Qty</th>
          <th>Adj Value</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        ${footer}
      </tbody>
      </table>
    
    </body>
    </html>
      `;
    return html;
  };

  return (
    <TouchableOpacity style={styles.button} onPress={fetchReportData}>
      <Text style={styles.buttonText}>Print Report</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: globalStyles.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
