import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
import { useNavigation } from '@react-navigation/native';
import SelectInput from '../../components/SelectInput';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import CyclesListTable from './components/CyclesListTable';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentCycle,
  setCyclesData,
  setSelectedCycleDetails,
  setWarehouses,
} from '../reducer/inventory';
import { showSnackbar } from '../../Snackbar/messageSlice';
import { validateVariable } from '../Utils/InventoryUtils';
import LoadingBackdrop from '../../components/Loaders/LoadingBackdrop';
import { setIsLoading } from '../../components/Loaders/toastReducers';

const InventoryCount = () => {
  const { currentCycle, cyclesData, warehouses } = useSelector(
    (state) => state.inventory
  );
  const { isLoading } = useSelector((state) => state.toast);
  const [warehouse, setWarehouse] = useState('');
  // const [warehouseCodeList, setWarehouseCodeList] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  const [cyclesVisible, setCyclesVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const CountOption = ({ name, route }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(route)}
        style={[styles.countOption, globalStyles.dFlexR]}
      >
        <Text style={styles.countOptionText}>{name}</Text>
      </TouchableOpacity>
    );
  };

  const renderDate = (da) => {
    return da?.split('T')[0];
  };

  const getWareHouseList = (warehouseCode) => {
    setWarehouseLoading(true);
    const epicor_endpoint = `/Erp.BO.WarehseSvc/Warehses?$select=WarehouseCode,Name,Description`;
    const postPayload = {
      epicor_endpoint,
      request_type: 'GET',
    };

    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload,
      stringify: false,
    })
      .then(({ json }) => {
        // setWarehouseCodeList(() => json.data.value);
        dispatch(setWarehouses(json.data.value));

        setWarehouseLoading(false);
      })
      .catch((err) => {
        setWarehouseLoading(false);
      });
  };

  const fetchCycles = () => {
    if (warehouse) {
      setCyclesLoading(true);
      const filter = encodeURI(`WarehouseCode eq '${warehouse}'`);
      const epicor_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles?$filter=${filter}&$top=1000`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            // setCyclesResponse(json.data.value);
            dispatch(setCyclesData(json.data.value));
            setCyclesLoading(false);
          })
          .catch((err) => {
            setCyclesLoading(false);
          });
      } catch (err) {
        setCyclesLoading(false);
      }
    } else {
      dispatch(showSnackbar('Select the warehouse First'));
    }
  };

  const onClickSelect = () => {
    dispatch(setCurrentCycle({}));
    setCyclesVisible(true);
    fetchCycles();
    // if (cyclesData.length == 0) {
    // }
  };
  const onSelectCycle = (val) => {
    dispatch(setCurrentCycle(val));
    setCyclesVisible(false);
  };

  useEffect(() => {
    if (warehouses && warehouses.length <= 0) {
      getWareHouseList();
    }
  }, []);

  // setSelectedCycleDetails
  function getSelectedCycleDetails() {
    if (warehouse) {
      // setCyclesLoading(true);
      dispatch(setIsLoading({ value: true, message: 'Please wait...' }));
      const filterString = encodeURI(
        `(WarehouseCode eq '${currentCycle.WarehouseCode}' and CycleSeq eq ${currentCycle.CycleSeq} and CCMonth eq ${currentCycle.CCMonth} and CCYear eq ${currentCycle.CCYear} and Company eq '${currentCycle.Company}' and Plant eq '${currentCycle.Plant}')`
      );
      const epicor_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles?$expand=CCDtls&$filter=${filterString}`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            // setCyclesResponse(json.data.value);
            dispatch(setSelectedCycleDetails(json.data.value));
            // setCyclesLoading(false);
            dispatch(setIsLoading({ value: false, message: '' }));
            navigation.navigate('cycle_details');
          })
          .catch((err) => {
            dispatch(setIsLoading({ value: false, message: '' }));
            dispatch(
              showSnackbar('Error Occured While fetching cycle Details')
            );
          });
      } catch (err) {
        dispatch(setIsLoading({ value: false, message: '' }));
        dispatch(showSnackbar('Error Occured While fetching cycle Details'));
      }
    } else {
      dispatch(setIsLoading({ value: false, message: '' }));
      dispatch(showSnackbar('Select the warehouse First'));
    }
  }

  const CycleDetails = () => {
    return (
      <View style={[globalStyles.dFlexR, styles.detailsContainer]}>
        <Text style={styles.label}> Selected Cycle </Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Warehouse</Text>
            <Text style={styles.value}>
              {currentCycle?.WarehouseCode || 'N/A'}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle Date</Text>
            <Text style={styles.value}>
              {renderDate(currentCycle?.CycleDate) || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle Seq</Text>
            <Text style={styles.value}>{currentCycle?.CycleSeq || 'N/A'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {currentCycle?.CycleStatusDesc || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LoadingBackdrop
        visible={isLoading}
        onDismiss={() => {
          setTimeout(() => {
            dispatch(setIsLoading({ value: false, message: '' }));
          }, 500);
        }}
      />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Inventory Count</Text>
      </View>
      <View style={{ padding: 30 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Warehouse Code</Text>
        <View style={{ marginBottom: 20 }}>
          <SelectInput
            value={warehouse}
            onChange={(itemValue, data) => {
              setWarehouse(itemValue);
            }}
            options={warehouses?.map((data) => ({
              ...data,
              label: data.WarehouseCode,
              value: data.WarehouseCode,
            }))}
            isLoading={warehouseLoading}
            label="Select warehouse"
            handleRefresh={getWareHouseList}
            placeholder={'Select Warehouse Code.'}
          />
        </View>
        <TouchableOpacity
          onPress={onClickSelect}
          style={[styles.countOption, globalStyles.dFlexR]}
        >
          <Text style={styles.countOptionText}>Search cycle</Text>
        </TouchableOpacity>
        {cyclesVisible && (
          <CyclesListTable
            data={cyclesData}
            loading={cyclesLoading}
            onSelectCycle={onSelectCycle}
          />
        )}
        {currentCycle && <CycleDetails />}
      </View>
      <TouchableOpacity
        disabled={validateVariable(currentCycle)}
        style={styles.receiveButton}
        onPress={() => getSelectedCycleDetails()}
      >
        <Text style={styles.receiveButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InventoryCount;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  header: {
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  countOption: {
    height: 30,
    borderRadius: 10,
    borderColor: globalStyles.colors.success,
    borderWidth: 2,
    marginBottom: 10,
    justifyContent: 'center',
  },
  countOptionText: {
    color: globalStyles.colors.success,
    fontWeight: '600',
    fontSize: 17,
  },
  detailsContainer: {
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  receiveButton: {
    backgroundColor: globalStyles.colors.success,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    width: '95%',
    zIndex: 10,
    marginHorizontal: 10,
  },
  receiveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
