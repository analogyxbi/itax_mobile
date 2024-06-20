import react from 'react';
import {
  ActivityIndicator,
  Pressable,
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
        <Text style={[{ width: 70 }, styles.heading]}>Date</Text>
        <Text style={[{ width: 45 }, styles.heading]}>WRH</Text>
        <Text style={[{ width: 35 }, styles.heading]}>Seq</Text>
        <Text style={[{ width: 80 }, styles.heading]}>Cycle Desc</Text>
        <Text style={[{ width: 80 }, styles.heading]}>WRH Desc</Text>
      </View>
      <ScrollView style={{ maxHeight: 300, minHeight: 50 }}>
        {loading && (
          <ActivityIndicator
            style={{ position: 'absolute', alignSelf: 'center', top: 100 }}
          />
        )}
        {!loading && data.length > 0 ? (
          <View>
            {data?.map((da) => (
              <TouchableOpacity onPress={() => onSelectCycle(da)}>
                <View style={styles.row}>
                  <Text style={[{ width: 70, padding: 2 }, styles.tableFont]}>
                    {renderDate(da?.CycleDate)}
                  </Text>
                  <Text style={[{ width: 45 }, styles.tableFont]}>
                    {da.WarehouseCode}
                  </Text>
                  <Text style={[{ width: 35 }, styles.tableFont]}>
                    {da.CycleSeq}
                  </Text>
                  <Text style={[{ width: 80 }, styles.tableFont]}>
                    {da.CycleStatusDesc}
                  </Text>
                  <Text style={[{ width: 80 }, styles.tableFont]}>
                    {da.CCHdrWarehseDescription}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            {true ? (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <Text style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  Please wait...
                </Text>
                <ActivityIndicator color={'lime'} />
              </View>
            ) : (
              <Text style={{ textAlign: 'center', paddingTop: 10 }}>
                No data
              </Text>
            )}
          </>
        )}
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.success,
  },
  heading: {
    fontWeight: '600',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  row: {
    fontWeight: '600',
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableFont: {
    fontSize: 12,
    textAlign: 'center',
  },
});
