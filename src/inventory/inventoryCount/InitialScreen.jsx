import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
const InitialScreen = ({ setScreen }) => {
  return (
    <ScrollView contentContainerStyle={styles.initialScreen}>
      <Text style={styles.label}>Cycle No: 1 WH</Text>
      <Text style={styles.label}>Cycle Date: 5/24/2024</Text>
      <Text style={styles.label}>Status: Tags Generated</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen('counting')}
      >
        <Text style={styles.buttonText}>Initiate Counting Process</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Count</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Print Report</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});

export default InitialScreen;
