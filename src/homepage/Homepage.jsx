import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Linking, Dimensions, TouchableOpacity, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
 
const screenWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
 
export default function Homepage() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const navigation = useNavigation();
 
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
 
    getBarCodeScannerPermissions();
  }, []);
 
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    if (data.startsWith('http')) {
      Alert.alert(
        'Open URL',
        `Do you want to open this URL?\n${data}`,
        [
          {
            text: 'Cancel',
            onPress: () => setScanned(false),
            style: 'cancel',
          },
          {
            text: 'Open',
            onPress: () => {
              setScanned(false);
              Linking.openURL(data);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    }
  };
 
  const openScanner = () => {
    setScannerVisible(true);
    setScanned(false);
  };
 
  const closeScanner = () => {
    setScannerVisible(false);
  };
 
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={()=>navigation.openDrawer()}
          style={styles.leftIcon}>
          <AntDesign name="caretright" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={require('../../images/analogyxbi-logo-horiz.png')}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={() => navigation.navigate('ProfileSettings')}
        >
          <AntDesign name="user" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.heading}>iTax</Text>
      {scannerVisible && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={styles.bottomButtons}>
        <Button title="Open Scanner" onPress={openScanner} />
        {scanned && (
          <Button
            title="Tap to Scan Again"
            onPress={() => setScanned(false)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 40,
    color: '#B628F8',
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  leftIcon: {
    marginRight: 'auto',
  },
  logo: {
    width: 120,
    height: 40,
  },
  rightIcon: {
    marginLeft: 'auto',
  },
});