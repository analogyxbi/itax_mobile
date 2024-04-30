import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Checkbox, Portal, SegmentedButtons, Modal, FAB } from 'react-native-paper';
import { globalStyles } from '../style/globalStyles';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import _ from 'lodash';
// import { encode } from 'base-64';
// import axios from 'axios';
// const baseURL = 'https://192.168.1.251/E10Dev/api/v1'; // Replace with your API URL
// const username = 'Analogyx1';
// const password = '3xt3rn@l1!';

const initialFormdata = {
  poNum: "",
  packslip: "",
  supplier_name: "",
  line: "",
  rel: "",
  order_qty: "",
  arrived_qty: "",
  input: "",
  note: "",
  warehouse_code: "",
  bin_number: ""
}

const POReceipt = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const navigation = useNavigation();
  const [tabValue, setTabvalue] = useState('1');
  const [scanned, setScanned] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [poNum, setPoNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [POData, setPOData] = useState([]);
  const [selectedPOdata, setSelectedPOdata] = useState({});
  const [currentLine, setCurrentLine] = useState({});
  const [showPOModal, setShowPOModal] = useState(false);

  const handleTabs = (val) => {
    setTabvalue(val);
  };
  const openScanner = () => {
    setScannerVisible(true);
    setScanned(false);
  };

  const closeScanner = () => {
    setScannerVisible(false);
  };

  useEffect(() => {
    setPoNum(parseInt(selectedPOdata?.PONum))
  }, [selectedPOdata])

  // if (hasPermission === null) {
  //     return <Text>Requesting for camera permission</Text>;
  // }
  // if (hasPermission === false) {
  //     return <Text>No access to camera</Text>;
  // }
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

  const getPoReciept = async () => {
    setLoading(true);
    const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$expand=RcvDtls`;
    if (poNum) {
      let filterQuery = encodeURI(`PONum eq ${poNum}`);
      epicor_endpoint.concat(`&$filter=${filterQuery}`);
    }
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: { epicor_endpoint, request_type: 'GET' },
        stringify: false,
      })
        .then(({ json }) => {
          setPOData(() => json.data.value);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } catch (err) {
      setLoading(false);
    }
  };

  const searchPoNum = () => {
    setShowPOModal(true);
  }

  useEffect(() => {
    console.log({POData})
    if (POData.length < 0) {
      getPoReciept()
    }
  }, [])

  const onSelectLine = (po) => {
    console.log(po);
    setCurrentLine(po);
    setTabvalue('3');
  };

  return (
    <SafeAreaView style={styles.container}>
      {scannerVisible ? (
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.closeButtonText}>Scan Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
              <Text style={styles.closeButtonText}>Close Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back-outline"
                size={24}
                color={globalStyles.colors.darkGrey}
              />
            </Pressable>
            <Text style={styles.heading}>PO Receipts</Text>
          </View>
          <View style={styles.body}>
            <SegmentedButtons
              value={tabValue}
              theme={{
                colors: {
                  secondaryContainer: globalStyles.colors.success,
                  onSecondaryContainer: 'white',
                },
              }}
              onValueChange={handleTabs}
              buttons={[
                {
                  value: '1',
                  label: 'Entry',
                  icon: () => (
                    <Ionicons
                      name="search"
                      size={24}
                      color={
                        tabValue === '1'
                          ? 'white'
                          : globalStyles.colors.darkGrey
                      }
                    />
                  ),
                },
                {
                  value: '2',
                  label: 'Receipt',
                  icon: () => (
                    <FontAwesome5
                      name="receipt"
                      size={24}
                      color={
                        tabValue === '2'
                          ? 'white'
                          : globalStyles.colors.darkGrey
                      }
                    />
                  ),
                },
                {
                  value: '3',
                  label: 'Line',
                  // disabled: _.isEmpty(currentLine),
                  icon: () => (
                    <Feather
                      name="list"
                      size={24}
                      color={
                        tabValue === '3'
                          ? 'white'
                          : globalStyles.colors.darkGrey
                      }
                    />
                  ),
                },
              ]}
            />
            {tabValue == '1' && (
              <View style={styles.tabView}>
                <Portal>
                  <Modal visible={showPOModal} onDismiss={() => setShowPOModal(false)} contentContainerStyle={styles.poModalContainer}>
                    <View style={[globalStyles.dFlexR, globalStyles.justifySB, styles.poModalHeader]}>
                      <Text style={{ color: "white" }}>PoNum</Text>
                      <Text style={{ color: "white" }}>VendorNumName</Text>
                    </View>
                    <ScrollView>
                      {
                        POData?.map(po => (
                          <View key={po.PONum}>
                            <TouchableOpacity onPress={() => { setSelectedPOdata(po); setPoNum(po.PONum); setShowPOModal(false) }}>
                              <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                <Text>{po.PONum}</Text>
                                <Text>{po.VendorNumName}</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        ))
                      }
                    </ScrollView>
                  </Modal>
                </Portal>
                <Text style={styles.inputLabel}>PO Num</Text>
                <View style={globalStyles.dFlexR}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    onChangeText={(text) => setPoNum(text)}
                    value={poNum}
                    editable={!loading}
                    placeholder="PO Num"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={openScanner}
                  >
                    <Text style={styles.closeButtonText}>
                      <AntDesign name="scan1" size={24} color="black" />
                    </Text>
                  </TouchableOpacity>
                  <Pressable onPress={searchPoNum}>
                    {!loading ? (
                      <Ionicons
                        name="search"
                        size={24}
                        color={globalStyles.colors.darkGrey}
                      />
                    ) : (
                      <ActivityIndicator
                        animating={true}
                        color={MD2Colors.red800}
                      />
                    )}
                  </Pressable>
                </View>
                <Text style={styles.inputLabel}>Packslip</Text>
                <TextInput
                  style={styles.input}
                  editable={!loading}
                  value={selectedPOdata?.PackSlip}
                  // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                  // value={formData?.confirm_password}
                  // secureTextEntry={true}
                  placeholder="Packslip"
                />
                <Text style={styles.inputLabel}>Supplier Name</Text>
                <Text
                  style={{ color: globalStyles.colors.darkGrey, margin: 10 }}
                >
                  {selectedPOdata?.VendorNumName}
                </Text>
                <TouchableOpacity
                  style={styles.receiveButton}
                  onPress={() => setTabvalue('2')}
                >
                  <Text style={styles.receiveButtonText}>Receive</Text>
                </TouchableOpacity>
                <FAB
                  icon="plus"
                  style={styles.fab}
                  onPress={() => console.log('Pressed')}
                />
              </View>
            )}
            {tabValue == '2' && (
              <View style={styles.tabView}>
                <View>
                  <Text style={styles.inputLabel}>Filter</Text>
                  <TextInput
                    style={styles.input}
                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                    // value={formData?.confirm_password}
                    // secureTextEntry={true}
                    placeholder="Filter"
                  />
                </View>
                <View style={{ maxHeight: "80%" }}>
                  <ScrollView >
                    {selectedPOdata &&
                      selectedPOdata?.RcvDtls?.map((po) => (
                        <View key={po.PONum}>
                          <TouchableOpacity onPress={() => onSelectLine(po)}>
                            <View>
                              <Text style={[styles.inputLabel, { color: 'black' }]}>
                                {po.Company}
                              </Text>
                              <Text style={{ paddingLeft: 10 }}>
                                {' '}
                                {selectedPOdata.EntryPerson}{' '}
                              </Text>
                              <View
                                style={[
                                  globalStyles.dFlexR,
                                  globalStyles.justifySB,
                                  { fontSize: 13 },
                                ]}
                              >
                                <Text style={{ paddingLeft: 10, fontSize: 13 }}>
                                  Packslip: {selectedPOdata.PackSlip}
                                </Text>
                                <Text style={{ paddingHorizontal: 10, fontSize: 13 }}>
                                  ShipViaCode : {selectedPOdata.ShipViaCode}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              </View>
            )}
            {tabValue == '3' && (
              <View style={styles.tabView}>
                <ScrollView style={{ flex: 1, maxHeight: '99%' }}>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View>
                      <Text style={styles.inputLabel}>PO</Text>
                      <Text style={{ padding: 10 }}>
                        {currentLine.PONum || '-'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Line</Text>
                      <Text style={{ padding: 10 }}>
                        {currentLine.POLine || '-'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Rel</Text>
                      <Text style={{ padding: 10 }}>
                        {currentLine.PORel || '-'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sideHeading}>Quantities</Text>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Order</Text>
                      <Text style={{ padding: 10 }}>{currentLine.OrderQty && parseInt(currentLine.OrderQty) || "-"}/{currentLine.PartNumSalesUM || "-"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Arrived</Text>
                      <Text style={{ padding: 10 }}>{currentLine.PORelArrivedQty && parseInt(currentLine.PORelArrivedQty) || "-"}/{currentLine.PartNumSalesUM || "-"}</Text>
                    </View>
                  </View>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Input</Text>
                      <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        // value={formData?.confirm_password}
                        // secureTextEntry={true}
                        placeholder="Input"
                      />
                    </View>
                    {/* <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>IUM</Text>
                      <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        // value={formData?.confirm_password}
                        // secureTextEntry={true}
                        placeholder="IUM"
                      />
                    </View> */}
                  </View>
                  {/* <View style={[globalStyles.dFlexR, globalStyles.justifySE]}>
                    <View>
                      <Text style={styles.inputLabel}>Complete</Text>
                      <Checkbox status={true ? 'checked' : 'unchecked'} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Insp Req</Text>
                      <Checkbox status={true ? 'checked' : 'unchecked'} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Print Label</Text>
                      <Checkbox status={true ? 'checked' : 'unchecked'} />
                    </View>
                  </View> */}
                  <Text style={styles.sideHeading}>Location</Text>
                  <View>
                    <Text style={styles.inputLabel}>Note</Text>
                    <TextInput
                      style={styles.input}
                      // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                      // value={formData?.confirm_password}
                      // secureTextEntry={true}
                      multiline={true}
                      placeholder="Note"
                    />
                  </View>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Warehouse Code</Text>
                      <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        value={currentLine?.WareHouseCode || "-"}
                        // secureTextEntry={true}
                        placeholder="Warehouse Code"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Bin Number</Text>
                      <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        value={currentLine?.BinNum}
                        // secureTextEntry={true}
                        placeholder="Bin Number"
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      globalStyles.dFlexR,
                      globalStyles.justifySE,
                      { padding: 5 },
                    ]}
                  >
                    {/* <Button
                      buttonColor={globalStyles.colors.primary}
                      icon="receipt"
                      mode="contained"
                      onPress={() => console.log('Pressed')}
                    >
                      PO
                    </Button> */}
                    <Button
                      buttonColor={globalStyles.colors.success}
                      icon="floppy"
                      mode="contained"
                      onPress={() => console.log('Pressed')}
                    >
                      Save
                    </Button>
                    <Button
                      buttonColor={globalStyles.colors.success}
                      icon="printer"
                      mode="contained"
                      onPress={() => console.log('Pressed')}
                    >
                      Print Tags
                    </Button>
                  </View>
                </ScrollView>
                {/* <TouchableOpacity
                  style={styles.receiveButton}
                  onPress={() => {}}
                >
                  <Text style={styles.receiveButtonText}>Save</Text>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
  },
  header: {
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
  },
  body: {
    padding: 10,
    height: '92%',
  },
  tabView: {
    marginTop: 10,
    flex: 1,
  },
  sideHeading: { fontWeight: '600', fontSize: 18, padding: 10 },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: globalStyles.colors.grey,
    borderWidth: 1,
  },
  select: {
    padding: 0,
  },
  inputLabel: {
    color: globalStyles.colors.darkGrey,
    fontWeight: '500',
    paddingLeft: 10,
    fontSize: 15,
  },
  receiveButton: {
    backgroundColor: globalStyles.colors.success,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  receiveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    // backgroundColor: '#B628F8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    // color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  poModalContainer: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    height: "80%",
    overflow: "scroll"
  },
  poModalHeader: {
    padding: 5,
    backgroundColor: globalStyles.colors.success,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
  },
});

export default POReceipt;
