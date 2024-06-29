import React from 'react';
import {
  View,
  StyleSheet,
  Button,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { globalStyles } from '../style/globalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';

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
  const { cycleTags, currentCycle } = useSelector((state) => state.inventory);
  const dispatch = useDispatch();
  const printToFile = async () => {
    const htmlContent = createDynamicTable();
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      console.log('File has been saved to:', uri);

      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error printing to file:', error);
    }
  };

  const createDynamicTable = () => {
    // Generating table rows dynamically
    let now = new Date();
    // console.log('NOW');
    const tableRows = cycleTags
      .filter((data) => data.PartNum.length > 0)
      .map(
        (item, index) =>
          `<tr key=${index}>
        <td>${item.PartNum}</td>
        <td>${item.TagNum}</td>
        <td>${item.BinNum}</td>
        <td>${item.UOM}</td>
        <td class="align-right">${parseAndFormatFloat(item.FrozenQOH, 2)}</td>
        <td class="align-right">${parseAndFormatFloat(item.CountedQty, 2)}</td>
        <td class="align-right"></td>
        <td class="align-right"></td>
        <td class="align-right"></td>
        <td class="align-center">${item.TagReturned ? 'Yes' : 'No'}</td>
      </tr>`
      )
      .join('');
    // console.log(tableRows);
    if (tableRows.length === 0) {
      return dispatch(showSnackbar('No Rows Found in tag with Tag Number'));
    }
    // Calculate totals
    const totals = {
      snapTotal: cycleTags
        .filter((data) => data.PartNum.length > 0)
        .reduce((acc, item) => acc + parseFloat(item.FrozenQOH), 0),
      countTotal: cycleTags
        .filter((data) => data.PartNum.length > 0)
        .reduce((acc, item) => acc + parseInt(item.CountedQty), 0),

      // marTotal: cycleTags.reduce((acc, item) => acc + item.mar, 0),
    };

    const footer = `<tfoot>
    <tr>
      <td colspan="4">Totals:</td>
      <td class="align-right">${totals.snapTotal} </td>
      <td class="align-right">${totals.countTotal} </td>
      <td class="align-right"></td>
      <td class="align-right"></td>
      <td class="align-right"></td>
      <td class="align-right"></td>
    </tr>
  </tfoot>`;
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
                <p>Whs: ${currentCycle.WarehouseCode} ;&nbsp;&nbsp;&nbsp;Per: ${
      currentCycle.CCHdrWarehseDescription
    } &nbsp;&nbsp;&nbsp;&nbsp;Yr:${
      currentCycle.CCYear
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
          <th>Inventory Snapshot</th>
          <th>Counted</th>
          <th>Adj Qty</th>
          <th>Adj %</th>
          <th>Adj Value</th>
          <th>Returned</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
      ${footer}
    </table>
    
    </body>
    </html>
      `;
    return html;
  };

  return (
    <TouchableOpacity style={styles.button} onPress={printToFile}>
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
