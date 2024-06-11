import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';

const BarcodeScannerComponent = ({
  closeScanner,
  captureDetails,
  cameraState,
}) => {
  const [detectedBarcodes, setDetectedBarcodes] = useState([]);
  const cameraRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (cameraRef.current && cameraRef.current.getSupportedCameraTypesAsync) {
        cameraRef.current.getSupportedCameraTypesAsync().then((types) => {
          if (types.includes(BarCodeScanner.Constants.Type.back)) {
            setDetectedBarcodes([]);
          }
        });
      }
    }, 500); // Clear detected barcodes if back camera is being used
    return () => clearInterval(intervalId);
  }, []);

  const handleBarCodeScanned = (barcode) => {
    if (
      !detectedBarcodes.some((code) => code?.data === barcode.data) &&
      barcode.data.trim()
    ) {
      setDetectedBarcodes(() => [barcode]);
    }
  };

  const passDetails = () => {
    const value = detectedBarcodes[0];
    if (value) {
      captureDetails(value?.data, cameraState);
      setDetectedBarcodes([]);
    } else {
      dispatch(showSnackbar('Not Barcode Found!'));
    }
  };

  const renderDetectedBoxes = () => {
    return detectedBarcodes.map((barcode, index) => {
      const { origin, size } = barcode.bounds;
      const { x, y } = origin;
      const { width, height } = size;
      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: height * 1.5,
            height: width / 1.5,
          }}
        >
          <Text
            style={{
              backgroundColor: 'white',
              color: 'black',
              height: 30,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {barcode.data}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        ref={cameraRef}
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        focusable={true}
      />
      {renderDetectedBoxes()}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.iconButtonRef}
          // onPress={() => setScanned(false)}
        >
          <Icon name="refresh" size={30} color="#fff" />
          {/* <Text style={styles.iconText}>Scan Again</Text> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButtonRef} onPress={passDetails}>
          <Icon name="camera" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButtonClose} onPress={closeScanner}>
          <Icon name="close" size={30} color="#fff" />
          {/* <Text style={styles.iconText}>Close Scanner</Text> */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    width: '100%',
    paddingHorizontal: 20,
  },
  iconButtonClose: {
    backgroundColor: '#FF0000',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonRef: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  detectedBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
  },
});

export default BarcodeScannerComponent;
