import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
import { useNavigation } from '@react-navigation/native';

const InventoryCount = () => {
  const navigation = useNavigation();
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
        <CountOption name="Select Cycle" route="select_inventory_cycle" />
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
    height: 50,
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
