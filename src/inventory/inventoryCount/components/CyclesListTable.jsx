import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../../../style/globalStyles';

const CyclesListTable = ({ data, loading, onSelectCycle }) => {
  const renderDate = (da) => {
    return da?.split('T')[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Date</Text>
        <Text style={styles.heading}>WRH</Text>
        <Text style={styles.heading}>Seq</Text>
        <Text style={styles.heading}>Cycle Desc</Text>
        <Text style={styles.heading}>WRH Desc</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {loading && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Please wait...</Text>
            <ActivityIndicator color={'lime'} />
          </View>
        )}
        {data.length > 0 ? (
          <View>
            {data?.map((da, index) => (
              <TouchableOpacity key={index} onPress={() => onSelectCycle(da)}>
                <View style={styles.row}>
                  <Text style={styles.tableFont}>
                    {renderDate(da?.CycleDate)}
                  </Text>
                  <Text style={styles.tableFont}>
                    {da.WarehouseCode}
                  </Text>
                  <Text style={styles.tableFont}>
                    {da.CycleSeq}
                  </Text>
                  <Text style={styles.tableFont}>
                    {da.CycleStatusDesc}
                  </Text>
                  <Text style={styles.tableFont}>
                    {da.CCHdrWarehseDescription}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )
          : !loading ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data found</Text>
            </View>) : <></> 
          }
      </ScrollView>
    </View>
  );
};

export default CyclesListTable;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: globalStyles.colors.success,
    borderWidth: 1,
  },
  header: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.success,
  },
  heading: {
    flex: 1, // Take up available space equally
    fontWeight: '600',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 300,
    minHeight: 50,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tableFont: {
    flex: 1, // Allow each cell to take up available space
    fontSize: 12,
    textAlign: 'center',
  },
  noDataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    verticalAlign: 'middle',
    marginRight: 10,
  },
});
