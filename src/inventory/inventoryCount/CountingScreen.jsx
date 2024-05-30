import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../style/globalStyles';
import { useNavigation } from '@react-navigation/native';

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
        <Text style={styles.heading}>Counting Process</Text>
      </View>
      <View style={[globalStyles.dFlexR, styles.detailsContainer]}>
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
            <Text style={styles.value}>Count Generated</Text>
          </View>
        </View>
      </View>
      <View style={styles.countingScreenContainer}>
        <ScrollView contentContainerStyle={styles.countingScreen}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
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
  detailsContainer: {
    flexWrap: "wrap",
    marginHorizontal: 50,
    marginVertical: 10
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

export default CountingScreen;
