import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export const savePDF = async (pdfBytes) => {
  const path = FileSystem.documentDirectory + 'example.pdf';
  try {
    await FileSystem.writeAsStringAsync(path, pdfBytes, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('PDF saved successfully:', path);
  } catch (error) {
    console.error('Error saving PDF:', error);
  }
};

export const generatePDF = async (currentLine, formData) => {
  const { uri } = await Print.printToFileAsync({
    html: `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
      <title>Document</title>
      <style type="text/css">
        .tr {
          line-height: 300px;
        }
        .tg {
          border-collapse: collapse;
          border-spacing: 0;
          margin-top: 30px;
        }
        .tg td {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          overflow: hidden;
          padding: 10px 5px;
          word-break: normal;
        }
        .tg th {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: normal;
          overflow: hidden;
          padding: 10px 5px;
          word-break: normal;
        }
        .tg .tg-0lax {
          text-align: left;
          vertical-align: top;
        }
        .barcode {
          font-family: 'Libre Barcode 39';
          font-size: 55px;
        }
        .table_div{
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .bottom_container{
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          flex-direction: column;
        }
        .bot_two{
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          margin-top: 60px;
          width: 100%;
        }
        .value{
          font-weight: 800;
          font-size: 22px;
          font-style: normal;
        }
        @font-face {
          font-family: 'Libre Barcode 39';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/librebarcode39/v21/-nFnOHM08vwC6h8Li1eQnP_AHzI2G_Bx0g.woff2)
            format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC,
            U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      </style>
    </head>
    <body>
      <div class="table_div">
        <table class="tg" style="table-layout: fixed; width: 750">
          <colgroup>
            <col style="width: 375px" />
            <col style="width: 375px" />
          </colgroup>
          <tbody>
            <tr style="height: 170px">
              <td class="tg-0lax" colspan="2">
                <div>
                  <div><i>Part : </i> <span class="value">${currentLine?.POLinePartNum}</span></div>
                  <div class="barcode">*${currentLine?.POLinePartNum}*</div>
                  <div><i>Rivision </i></div>
                  <div class="value">Remote Monitoring & Patch Managment</div>
                </div>
              </td>
            </tr>
            <tr style="height: 120px">
              <td class="tg-0lax">
                <div>
                  <div><i>Vendor :</i> <span class="value">${currentLine?.VendorID} / ${currentLine?.VendorName}</span></div>
                  <div  class="barcode">*${currentLine?.VendorID}*</div>
                  <div><i>PO/Line/Rel :</i> <b>${currentLine?.PONum} / ${currentLine?.POLine} / ${currentLine?.PORelNum}</b></div>
                </div>
              </td>
              <td class="tg-0lax">
                <div>
                  <div><i>Quantity</i> : <span class="value" style="padding-left: 10px;">${currentLine?.ArrivedQty} ${currentLine?.IUM}</span></span></div>
                  <div style="padding-left: 75px; padding-top: 12px;" class="barcode">*${currentLine?.ArrivedQty}*</div>
                </div>
              </td>
            </tr>
            <tr style="height: 170px">
              <td class="tg-0lax" colspan="2">
                <div class="bottom_container">
                  <div class="receipt_part"> <span class="value">Miscellaneous Receipt</span> </div>
                  <div class="bot_two">
                    <div class="warehouse_part">
                      <div><i>Warehouse :</i> <span class="value">${formData?.WareHouseCode}</span></div>
                      <div class="barcode">*${formData?.WareHouseCode}*</div>
                    </div>
                    <div class="bin_part">
                      <div><i>Bin :</i> <span class="value">${formData?.BinNum}</span></div>
                      <div class="barcode">*${formData?.BinNum}*</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>`,
  });
  console.log('File has been saved to:', uri);
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};

export const generatTransferPDF = async (data, parts) => {
  // <div><i>Vendor :</i> <span class="value">${currentLine?.VendorID} / ${currentLine?.VendorName}</span></div>
  //                 <div  class="barcode">*${currentLine?.VendorID}*</div>
  //                 <div><i>PO/Line/Rel :</i> <b>${currentLine?.PONum} / ${currentLine?.POLine} / ${currentLine?.PORelNum}</b></div>

  const part = parts.find((o) => o.PartNum === data.current_part);
  console.log({ part, parts, data });
  const { uri } = await Print.printToFileAsync({
    html: `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>Document</title>
      <style type="text/css">
        .tr {
          line-height: 300px;
        }
        .tg {
          border-collapse: collapse;
          border-spacing: 0;
          margin-top: 30px;
        }
        .tg td {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          overflow: hidden;
          padding: 10px 5px;
          word-break: normal;
        }
        .tg th {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: normal;
          overflow: hidden;
          padding: 10px 5px;
          word-break: normal;
        }
        .tg .tg-0lax {
          text-align: left;
          vertical-align: top;
        }
        .barcode {
          font-family: 'Libre Barcode 39';
          font-size: 55px;
        }
        .table_div{
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .bottom_container{
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          flex-direction: column;
        }
        .bot_two{
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          margin-top: 60px;
          width: 100%;
        }
        .value{
          font-weight: 800;
          font-size: 22px;
          font-style: normal;
        }
        @font-face {
          font-family: 'Libre Barcode 39';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/librebarcode39/v21/-nFnOHM08vwC6h8Li1eQnP_AHzI2G_Bx0g.woff2)
            format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC,
            U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      </style>
    </head>
    <body>
      <div class="table_div">
        <table class="tg" style="table-layout: fixed; width: 750">
          <colgroup>
            <col style="width: 375px" />
            <col style="width: 375px" />
          </colgroup>
          <tbody>
            <tr style="height: 170px">
              <td class="tg-0lax" colspan="2">
                <div>
                  <div><i>Part : </i> <span class="value">${data?.current_part}</span></div>
                  <div class="barcode">*${data?.current_part}*</div>
                  <div><i>Rivision </i></div>
                  <div class="value">Remote Monitoring & Patch Managment</div>
                </div>
              </td>
            </tr>
            <tr style="height: 120px">
              <td class="tg-0lax">
                <div>
                <div class="value">Stock Transfer</div>
                </div>
              </td>
              <td class="tg-0lax">
                <div>
                  <div><i>Quantity</i> : <span class="value" style="padding-left: 10px;">${data?.quantity} ${part?.IUM} </span></span></div>
                  <div style="padding-left: 75px; padding-top: 12px;" class="barcode">*${data?.quantity}*</div>
                </div>
              </td>
            </tr>
            <tr style="height: 170px">
              <td class="tg-0lax" colspan="2">
                <div class="bottom_container">
                  <div class="receipt_part"> <span class="value">Miscellaneous Receipt</span> </div>
                  <div class="bot_two">
                    <div class="warehouse_part">
                      <div><i>Warehouse :</i> <span class="value">${data?.to_whse}</span></div>
                      <div class="barcode">*${data?.to_whse}*</div>
                    </div>
                    <div class="bin_part">
                      <div><i>Bin :</i> <span class="value">${data?.to_bin}</span></div>
                      <div class="barcode">*${data?.to_bin}*</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>`,
  });
  console.log('File has been saved to:', uri);
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};
