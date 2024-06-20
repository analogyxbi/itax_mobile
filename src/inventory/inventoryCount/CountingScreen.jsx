import React, { useState } from 'react';
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
import BarcodeScannerComponent from '../../components/BarcodeScannerComponent';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../Snackbar/messageSlice';

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
  currentCycle,
}) => {
  const navigation = useNavigation();

  const [cameraState, setCameraState] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const openScanner = () => {
    setScannerVisible(true);
  };
  const closeScanner = () => {
    setCameraState(null);
    setScannerVisible(false);
  };

  function captureDetails(details, state) {
    if (cameraState != 'bin' && cameraState != 'part') {
      setCameraState(null);
      closeScanner();
      return dispatch(
        showSnackbar('Warehouse or bin not found for the part number')
      );
    }
    if (cameraState === 'part') {
      setPart(details);
    } else if (details.includes('/')) {
      let data = details.split(' / ');
      setBin(data[0]);
    }
    // setFormData((prev) => ({ ...prev, [state]: details }));
    setCameraState(null);
    closeScanner();
  }

  if (scannerVisible) {
    return (
      <BarcodeScannerComponent
        closeScanner={closeScanner}
        captureDetails={captureDetails}
        cameraState={cameraState}
      />
    );
  }

  return (
    <View style={styles.container}>
      {scannerVisible ? (
        <BarcodeScannerComponent
          closeScanner={closeScanner}
          captureDetails={captureDetails}
          cameraState={cameraState}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Pressable onPress={() => setScreen('initial')}>
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
                <Text style={styles.value}>{currentCycle.CycleSeq} </Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Warehouse</Text>
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
          <View style={styles.countingScreenContainer}>
            <ScrollView contentContainerStyle={styles.countingScreen}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Part (Scanning / Enter)"
                  value={part}
                  onChangeText={setPart}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    setCameraState('part');
                    setScannerVisible(true);
                  }}
                >
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
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    setCameraState('bin');
                    setScannerVisible(true);
                  }}
                >
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
        </>
      )}
    </View>
  );
};

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
  countingScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countingScreen: {
    padding: 20,
    alignItems: 'center',
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderColor: '#ccc',
    width: '100%',
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
    flexWrap: 'wrap',
    marginHorizontal: 50,
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
});

export default CountingScreen;
