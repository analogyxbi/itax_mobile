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

const SelectCycle = () => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Select Cycle</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle No</Text>
            <Text style={styles.value}>1</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>WH</Text>
            <Text style={styles.value}>Killy</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle Date</Text>
            <Text style={styles.value}>24/05/2024</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>Tags Generated</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <CountOption
          name="Initiate Counting Process"
          route="select_inventory_cycle"
        />
        <CountOption name="Count" route="select_inventory_cycle" />
        <CountOption name="Print Report" route="select_inventory_cycle" />
        <CountOption name="Post" route="select_inventory_cycle" />
      </View>
    </View>
  );
};

export default SelectCycle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  actionsContainer: {
    padding: 20,
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
