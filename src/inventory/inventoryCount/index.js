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
import { setCurrentCycle, setCyclesData } from '../reducer/inventory';

const InventoryCount = () => {
  const { currentCycle, cyclesData } = useSelector((state) => state.inventory);
  const [cyclesResponse, setCyclesResponse] = useState(cyclesData);
  const [warehouseCode, setWarehouseCode] = useState("");
  const [selectedCycle, setSelectedCycle] = useState(currentCycle);
  const [cyclesLoading, setCyclesLoading] = useState(false)
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

  const fetchCycles = () => {
    setCyclesLoading(true);
    const epicor_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles`;
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: { epicor_endpoint, request_type: 'GET' },
        stringify: false,
      })
        .then(({ json }) => {
          // setCyclesResponse(json.data.value);
          dispatch(setCyclesData(json.data.value))
          console.log("response", json.data.value)
          setCyclesLoading(false);
        })
        .catch((err) => {
          setCyclesLoading(false);
        });
    } catch (err) {
      setCyclesLoading(false);
    }
  }

  const onClickSelect = () => {
    setCyclesVisible(true);
    if (cyclesData.length == 0) {
      fetchCycles();
    }
  }
  const onSelectCycle = (val) => {
    console.log({ val })
    dispatch(setCurrentCycle(val));
    // setSelectedCycle(val)
    setCyclesVisible(false);
  }

  useEffect(() => {
    fetchCycles();
  }, []);

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
        <Text style={styles.heading}>Inventory Count</Text>
      </View>
      <View style={{ padding: 40 }}>
        <TouchableOpacity
          onPress={onClickSelect}
          style={[styles.countOption, globalStyles.dFlexR]}
        >
          <Text style={styles.countOptionText}>Select cycle</Text>
        </TouchableOpacity>
        {/* {cyclesLoading && <ActivityIndicator />} */}
        {cyclesVisible && <CyclesListTable data={cyclesData} loading={cyclesLoading} onSelectCycle={onSelectCycle} />}

        {/* <CountOption name="Select Cycle" route="select_inventory_cycle" />
        <CountOption name="Cycle Details" route="cycle_details" /> */}
        {/* 
        <CountOption name="Cycle Count Period" route="cycle_count_period" />
        <CountOption
          name="Cycle Count Schedule"
          route="inventory_cycle_schedule"
        />
        <CountOption name="Inventory Count Cycle" route="cycle_count_period" /> */}
      </View>
    </View>
  );
};

export default InventoryCount;

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
});
