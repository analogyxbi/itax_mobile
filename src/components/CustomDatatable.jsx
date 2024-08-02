import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { ActivityIndicator, DataTable } from 'react-native-paper';
import { useState } from 'react';
import { useEffect } from 'react';

const CustomDatatable = ({
  data,
  totalPages,
  onPageChange,
  label,
  page,
  columnHeaders,
  onRowPress,
  loading = false,
}) => {
  const [rows, setRows] = useState(data);

  useEffect(() => {
    setRows(() => data);
  }, [data]);
  return (
    <View>
      <DataTable>
        <DataTable.Header>
          {columnHeaders.map((header) => (
            <DataTable.Title>{header}</DataTable.Title>
          ))}
        </DataTable.Header>
        {loading ? (
          <View style={{ marginTop: 12 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 450 }}>
            {rows.map((values, rowIndex) => (
              <DataTable.Row key={rowIndex} onPress={() => onRowPress(values)}>
                {columnHeaders.map((column, colIndex) => (
                  <DataTable.Cell key={colIndex}>
                    {values[column]}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </ScrollView>
        )}

        <DataTable.Pagination
          page={page}
          numberOfPages={1000}
          onPageChange={onPageChange}
          label={`${page} of 1000`}
          theme={{ colors: { primary: 'black', text: 'black' } }}
        />
      </DataTable>
    </View>
  );
};

export default CustomDatatable;
