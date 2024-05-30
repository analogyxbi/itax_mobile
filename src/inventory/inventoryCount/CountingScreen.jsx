import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../style/globalStyles';

const CountingScreen = ({
  part,
  setPart,
  bin,
  setBin,
  countedQty,
  setCountedQty,
  notes,
  setNotes,
  setScreen,
}) => {
  return (
    <View style={styles.countingScreenContainer}>
      <ScrollView contentContainerStyle={styles.countingScreen}>
        <Text style={styles.label}>Cycle No: 1 WH</Text>
        <Text style={styles.label}>Cycle Date: 5/24/2024</Text>
        <Text style={styles.label}>Status: Count Started</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Part (Scanning / Enter)"
            value={part}
            onChangeText={setPart}
          />
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="scan-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Bin (Scanning / Enter)"
            value={bin}
            onChangeText={setBin}
          />
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="scan-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.inputNoIcon}
          placeholder="Counted Qty (Manual Input)"
          value={countedQty}
          onChangeText={setCountedQty}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.inputNoIcon}
          placeholder="Notes (Manual Input - If any)"
          value={notes}
          onChangeText={setNotes}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setScreen('initial')}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => {
            setPart('');
            setBin('');
            setCountedQty('');
            setNotes('');
          }}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  countingScreenContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countingScreen: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: 300,
    height: 40,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
  },
  inputNoIcon: {
    width: 300,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  icon: {
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  footerButton: {
    width: 150,
    height: 50,
    backgroundColor: globalStyles.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CountingScreen;
