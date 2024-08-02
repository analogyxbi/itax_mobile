import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '16.6%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Create Document Component
const ReportPdf = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Woodland Kitchens NI Ltd</Text>
      <Text style={styles.header}>Detail Count Variance Report</Text>
      <Text style={styles.header}>
        Whs:Contracts Per: test Yr:2024 Cycle:18
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {[
            'Part',
            'Tag',
            'Bin',
            'Lot Number',
            'Inventory Snapshot',
            'Counted',
            'Prev Count',
            'Adj Qty',
            'Adj %',
            'Adj Value',
            'Returned',
          ].map((header) => (
            <View style={styles.tableCol} key={header}>
              <Text style={[styles.tableCell, styles.header]}>{header}</Text>
            </View>
          ))}
        </View>
        {data.map((row, index) => (
          <View style={styles.tableRow} key={index}>
            {Object.values(row).map((cell, cellIndex) => (
              <View style={styles.tableCol} key={cellIndex}>
                <Text style={styles.tableCell}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Totals:</Text>
          </View>
          {[
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            data
              .reduce((acc, item) => acc + parseFloat(item.adjQty), 0)
              .toFixed(2),
            '',
            data
              .reduce((acc, item) => acc + parseFloat(item.adjValue), 0)
              .toFixed(2),
            '',
          ].map((total, index) => (
            <View style={styles.tableCol} key={index}>
              <Text style={styles.tableCell}>{total}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default ReportPdf;
