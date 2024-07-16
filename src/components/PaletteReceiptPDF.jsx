import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { AnalogyxBIClient } from '@analogyxbi/connection';

const PalleteReceiptPDF = () => {
  const [pdfUri, setPdfUri] = useState(null);


  async function generatePDF(svgXmlString){
    try {
      // Define HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                text-align: left;
                padding: 8px;
                font-size:22px;
                font-weight:800;
                height: 50px; /* Adjust this value to increase row height */
              }
              th {
                background-color: #f2f2f2;
                text-align: center;
              }
              td:nth-child(2) {
                text-align: center;
              }
              .title-row {
                color: white;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <table>
              <tr class="title-row">
                <td rowspan="2" bgcolor="black"  style="color:white">PALLET RECEIPT</td>
                <td rowspan="1" colspan="2" style="color:black">Hardware Line</td>
              </tr>
              <tr>
                <td bgcolor="black" style="color:white">SUPPLIER</td>
                <td>Woodland Ni</td>
              </tr>
              <tr>
                <td>PO Number</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Delivery Note</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Part Code</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Description</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Date</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td>Bin</td>
                <td colspan="2"></td>
              </tr>
            </table>
            <div style="text-align:center; margin-top:20px;">
              <img src="data:image/png;base64,${svgXmlString}" alt="QR Code" />
            </div>
          </body>
        </html>
      `;

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      console.log('File has been saved to:', uri);

      // Share or perform any action with the generated PDF file
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

      // Set the generated PDF URI (if needed for displaying or further operations)
      setPdfUri(uri);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }


  const generateQRCodeAndPrintPDF = async () => {
    AnalogyxBIClient.post({endpoint:`/erp_woodland/resolve_api`, postPayload:{
      text_qr:"ABBA / JDFJSKDFD / DKSFKDFNKFDK"
    }}).then(({json})=>{
      generatePDF(json.image)
    }).catch((err)=>{
      alert("FAILED IMAGE")
      alert(JSON.stringify(err))
    })
  };

  return (
    <TouchableOpacity
      onPress={generateQRCodeAndPrintPDF}
      style={styles.loginButton}
    >
      <Text style={styles.loginText}>Generate PDF with QR Code</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: '#4287F5',
    width: 300,
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  loginText: {
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
});

export default PalleteReceiptPDF;
