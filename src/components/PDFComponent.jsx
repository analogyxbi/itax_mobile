import React from 'react';
import { View, Button } from 'react-native';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPdf from './ReportPdf';

const data = [
  {
    part: '506.16.740',
    tag: '000000326.1',
    bin: 'APP',
    lotNumber: 'Ea',
    inventorySnapshot: '0.00',
    counted: '10.00',
    prevCount: '0.00',
    adjQty: '10.00',
    adjPct: '0.00',
    adjValue: '580.00',
    returned: 'Yes',
  },
  // Add more objects for the table rows
];
const PDFComponent = () => {
  return (
    <View>
      <PDFDownloadLink
        document={<ReportPdf data={data} />}
        fileName="report.pdf"
      >
        {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
      </PDFDownloadLink>
    </View>
  );
};

export default PDFComponent;
