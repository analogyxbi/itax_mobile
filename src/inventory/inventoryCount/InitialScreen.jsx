import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const InitialScreen = ({ setScreen, currentCycle, generateTagsAndStartCount }) => {
  const navigation = useNavigation();
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
        <Text style={styles.heading}>Cycle Details</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle No</Text>
            <Text style={styles.value}>{currentCycle.CycleSeq} </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>WH</Text>
            <Text style={styles.value}>
              {currentCycle.CCHdrWarehseDescription}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle Date</Text>
            <Text style={styles.value}>
              {new Date(currentCycle.CycleDate).toISOString().split('T')[0]}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{currentCycle.CycleStatusDesc}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.initialScreen}>
        {/* <Text style={styles.label}>Cycle No: 1 WH</Text>
        <Text style={styles.label}>Cycle Date: 5/24/2024</Text>
        <Text style={styles.label}>Status: Tags Generated</Text> */}
        <TouchableOpacity style={styles.button} onPress={generateTagsAndStartCount} >
          <Text style={styles.buttonText}>Initiate Counting Process</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScreen('counting')}
        >
          <Text style={styles.buttonText}>Count</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Print Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
  initialScreen: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: globalStyles.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default InitialScreen;
