import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { globalStyles } from '../style/globalStyles';
import Transferbackdrop from '../components/Loaders/Transferbackdrop';
import SuccessBackdrop from '../components/Loaders/SuccessBackdrop';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
  setWarehouses,
} from './reducer/inventory';
import { showSnackbar } from '../Snackbar/messageSlice';
import ErrorBackdrop from '../components/Loaders/ErrorBackdrop';

const InventoryTransfer = () => {
  const { warehouses, isLoading, onSuccess, onError } = useSelector(
    (state) => state.inventory
  );
  const dispatch = useDispatch();
  const [current, setCurrent] = useState({});
  const [target, setTarget] = useState({});
  const [bins, setBins] = useState([]);
  const navigation = useNavigation();
  const animationRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const restartAnimation = () => {
    animationRef.current?.restartAnimation();
  };

  function initiateTransfer() {
    dispatch(setIsLoading(true));
    // async code to transfer the part and bin
    setTimeout(() => {
      // on Success
      dispatch(setOnSuccess(true));
      // on failed transfer
      // dispatch(setOnError(true));
    }, 2000);
  }

  function getWarehouse() {
    setRefreshing(true);
    const postPayload = {
      epicor_endpoint:
        '/Erp.BO.WarehseSvc/Warehses?$select=WarehouseCode,Name,Description',
      request_type: 'GET',
    };
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          dispatch(setWarehouses(json.data.value));
          setRefreshing(false);
          dispatch(showSnackbar('Warehouse List refreshed'));
        })
        .catch((err) => {
          // setLoading(false);
          setRefreshing(false);
          dispatch(
            showSnackbar(
              'Error getting the list of warehouses',
              JSON.stringify(err)
            )
          );
        });
    } catch (err) {
      console.log({ err });
    }
  }

  useEffect(() => {
    if (warehouses.length == 0) {
      getWarehouse();
    }
  }, []);

  function onSelectWarehouse(value, key) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  function onSelectTarget(value, key) {
    setTarget((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Inventory Transfer</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getWarehouse} />
        }
      >
        <View style={styles.container}>
          <Transferbackdrop
            loading={isLoading && !onSuccess}
            setLoading={(value) => dispatch(setIsLoading(value))}
          />
          <SuccessBackdrop
            visible={onSuccess}
            onDismiss={() => {
              setTimeout(() => {
                dispatch(setOnSuccess(false));
                dispatch(setIsLoading(false));
              }, 500);
            }}
          />
          <ErrorBackdrop
            visible={onError}
            onDismiss={() => {
              setTimeout(() => {
                dispatch(setOnError(false));
                dispatch(setIsLoading(false));
              }, 500);
            }}
          />

          <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Current Warehouse</Text>
              <RNPickerSelect
                selectedValue={current.warehouse}
                onValueChange={(itemValue) => {
                  onSelectWarehouse(itemValue, 'warehouse');
                  // loadBins(itemValue);
                }}
                items={warehouses.map((data) => ({
                  ...data,
                  label: data.WarehouseCode,
                  value: data.WarehouseCode,
                }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Current Bin</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => onSelectWarehouse(text, 'curr_bin')}
                value={current?.curr_bin}
                placeholder="Current Bin"
              />
            </View>
          </View>
          <View>
            <Text style={styles.inputLabel}>Select Product</Text>
            <TextInput
              style={styles.input}
              // onChangeText={(text) => onChangeText(text, 'confirm_password')}
              // value={formData?.confirm_password}
              placeholder="Select Product"
            />
          </View>
          <Text style={{ margin: 10, color: globalStyles.colors.darkGrey }}>
            Stock: ##{' '}
          </Text>
          <View>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              // onChangeText={(text) => onChangeText(text, 'confirm_password')}
              // value={formData?.confirm_password}
              placeholder="Enter Quantity here"
            />
          </View>
          <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>To Warehouse</Text>
              <RNPickerSelect
                selectedValue={target.warehouse}
                onValueChange={(itemValue) => {
                  onSelectTarget(itemValue, 'warehouse');
                }}
                items={warehouses.map((data) => ({
                  ...data,
                  label: data.WarehouseCode,
                  value: data.WarehouseCode,
                }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>To Bin</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => onSelectTarget(text, 'to_bin')}
                value={target?.to_bin}
                placeholder="Target Bin"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.receiveButton} onPress={initiateTransfer}>
        <Text style={styles.receiveButtonText}>Transfer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InventoryTransfer;

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: globalStyles.colors.grey,
    borderWidth: 1,
  },
  inputLabel: {
    color: globalStyles.colors.darkGrey,
    fontWeight: '500',
    paddingLeft: 10,
    fontSize: 15,
  },
  receiveButton: {
    backgroundColor: globalStyles.colors.success,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    marginLeft: '5%',
    width: '90%',
  },
  receiveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
