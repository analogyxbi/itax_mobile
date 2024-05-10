import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
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
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';
import { Barcode } from 'expo-barcode-generator';
import PrintBarcodeScreen from './PrintBarcodesScreen';
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
  WareHouseCode: "",
  BinNum: ""
}

const POReceipt = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [poDataResponse, setpoDataResponse] = useState([]);
  const [warehouseCodes, setWarehouseCodes] = useState([]);
  const [isNewPackSlip, setIsNewpackslip] = useState(true);
  const [createPackslipLoading, setCreatepackslipLoading] = useState(false);
  const navigation = useNavigation();
  const [tabValue, setTabvalue] = useState('1');
  const [scanned, setScanned] = useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [poNum, setPoNum] = useState();
  const [loading, setLoading] = useState(false);
  const [POData, setPOData] = useState([]);
  const [packSLipNUm, setPackSlipNUm] = useState("");
  const [packslipData, setPackSlipData] = useState([]);
  const [selectedPackSlip, setSelectedPackslip] = useState({});
  const [packslipLoading, setPackslipLoading] = useState(false);
  const [isPosLoading, setIsPOsLoading] = useState(false);
  const [selectedPOdata, setSelectedPOdata] = useState({});
  const [currentLine, setCurrentLine] = useState({});
  const [showPOModal, setShowPOModal] = useState(false);
  const [formData, setFormdata] = useState(initialFormdata);
  const [saved, setSaved] = useState(false);
  const [bins, setBins] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [openBarcodescreen, setOpenBarcodeScreen] = useState(false);
  const dispatch = useDispatch();

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

  // useEffect(() => {
  //   setPoNum(parseInt(selectedPOdata?.PONum))
  // }, [selectedPOdata])

  const renderWarehouseOptions = (values) => {
    const result = values.map((val) => ({
      ...val,
      label: val.WarehouseCode,
      value: val.WarehouseCode,
    }));
    return result;
  };

  const renderBinOptions = (values) => {
    const result = values.map((val) => ({
      ...val,
      label: val.BinNum,
      value: val.BinNum,
    }));
    return result;
  }
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
    // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$expand=RcvDtls`;
    // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$select=PackSlip,Company,PORel,ShipViaCode,PONum,RcvDtls/BinNum,RcvDtls/PONum,RcvDtls/POLine,RcvDtls/PackLine,RcvDtls/WareHouseCode,VendorNumName&$expand=RcvDtls`;
    if (poNum) {
      // let filterQuery = encodeURI(`PONum eq ${poNum}`);
      // epicor_endpoint = epicor_endpoint + `&$filter=${filterQuery}`
      // const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$filter=PONum eq ${poNum}`
      const epicor_endpoint = `/Erp.BO.POSvc/POes?$filter=PONum eq ${poNum}&$expand=PODetails`
      // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$select=PackSlip,Company,PORel,ShipViaCode,PONum,RcvDtls/BinNum,RcvDtls/PONum,RcvDtls/POLine,RcvDtls/PackLine,RcvDtls/WareHouseCode,VendorNumName&$expand=RcvDtls&$filter=PONum eq ${poNum}`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            console.log("po data", json.data.value)
            setPOData(() => json.data.value)
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            console.log({ err })
          });
      } catch (err) {
        setLoading(false);
      }
    } else {
      dispatch(showSnackbar('Enter the PO Num first'));
      setLoading(false)
    }
  };

  const fetchPackslips = () => {
    setPackslipLoading(true)
    if (poNum) {
      setIsNewpackslip(false);
      const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$select=PackSlip,Company,PORel,ShipViaCode,EntryPerson,PONum,RcvDtls/BinNum,RcvDtls/PONum,RcvDtls/POLine,RcvDtls/PackLine,RcvDtls/WareHouseCode,VendorNumName&$expand=RcvDtls&$filter=PONum eq ${poNum}`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            console.log("packslip data", json.data.value)
            setPackSlipData(() => json.data.value)
            setPackslipLoading(false);
            setIsNewpackslip(false);
          })
          .catch((err) => {
            setPackslipLoading(false);
            setIsNewpackslip(true);
          });
      } catch (err) {
        setPackslipLoading(false);
        setIsNewpackslip(true);
      }
    } else {
      dispatch(showSnackbar('Enter the PO Num first'));
      setPackslipLoading(false)
    }
  }
  useEffect(() => {
    if (tabValue === "2") {
      fetchPackslips();
    }
  }, [tabValue])

  const getWareHouseList = () => {
    const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins`;
    // if (poNum) {
    //   let filterQuery = encodeURI(`PONum eq ${poNum}`);
    //   epicor_endpoint.concat(`&$filter=${filterQuery}`);
    // }
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: { epicor_endpoint, request_type: 'GET' },
        stringify: false,
      })
        .then(({ json }) => {
          setWarehouseCodes(() => json.data.value);
          // setLoading(false);
        })
        .catch((err) => {
          // setLoading(false);
        });
    } catch (err) {
      // setLoading(false);
    }
  }
  const onChangeText = (val, name) => {
    setFormdata(form => ({ ...form, [name]: val }));
    if (name === "WareHouseCode") {
      console.log({ warehouseCodes, val, name })
      const filteredWareHouse = warehouseCodes?.filter(warehouse => warehouse?.WarehouseCode === val);
      console.log({ filteredWareHouse })
      setBins(filteredWareHouse);
    }
    setSaved(false);
  }

  const handleCreateUpdatePackSlip = () => {
      createPackSlip();
  }
  const createPackSlip = () => {
    setCreatepackslipLoading(true)
    if (packSLipNUm) {
      setIsNewpackslip(false);
      const today = new Date().toISOString();
      const formattedDate = today.substring(0, 19);
      const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts`;
      const postData = {
        Company: POData[0]?.Company,
        VendorNum: POData[0]?.VendorNum,
        PackSlip: packSLipNUm,
        ReceiptDate: formattedDate,
        Invoiced: false,
        PONum: POData[0]?.PONum,
        RowMod: "A"
      };
      console.log({postData})
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'POST', data: JSON.stringify(postData) },
          stringify: false,
        })
          .then(({ json }) => {
            console.log("add packslip", json.data.value)
            dispatch(showSnackbar('Packslip added succesfully'));
            setCreatepackslipLoading(false);
          })
          .catch((err) => {
            console.log({ err })
            dispatch(showSnackbar('Error adding the Packslip'));
            setCreatepackslipLoading(false);
          });
      } catch (err) {
        console.log({ err })
        setCreatepackslipLoading(false);
      }
    } else {
      dispatch(showSnackbar('Enter the Packslip first'));
      setCreatepackslipLoading(false)
    }
  }

  const searchPoNum = () => {
    setIsPOsLoading(true)
    // if (vendorNameSearch) {
    setIsNewpackslip(false);
    // const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$filter=startswith(VendorName,${vendorNameSearch})`;
    const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches`
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: { epicor_endpoint, request_type: 'GET' },
        stringify: false,
      })
        .then(({ json }) => {
          console.log("Po nums", json.data.value)
          setpoDataResponse(() => json.data.value)
          setFilteredPos(json.data.value);
          setIsPOsLoading(false);
        })
        .catch((err) => {
          console.log({ err })
          setIsPOsLoading(false);
        });
    } catch (err) {
      console.log({ err })
      setIsPOsLoading(false);
    }
    // } else {
    //   dispatch(showSnackbar('Enter the vendor name first'));
    //   setIsPOsLoading(false)
    // }
  }

  const onChangeSearchQuery = (val) => {
    setVendorNameSearch(val);
    const filteredData = poDataResponse?.filter(data => data?.VendorName?.lowerCase().includes(val.lowerCase()))
    setFilteredPos(filteredData)
  }

  useEffect(() => {
    // getWareHouseList()
    if (showPOModal) {
      searchPoNum()
    }
  }, [showPOModal])

  const onSelectPackslip = (po) => {
    console.log(po.PONum, po)
    setPackSlipNUm(po?.PackSlip)
    setSelectedPackslip(po);
  }

  const onSelectLine = (po) => {
    setCurrentLine(po);
    setTabvalue('3');
  };

  const handleSave = () => {
    const postPayload = {
      RcvHead_PONum: 26876,
      RcvHead_VendorNum: 1,
      RcvHead_ArrivedDate: "2024-05-02",
      RcvHead_ReceiptDate: "2024-05-02",
      RcvDtl_POLine: 1,
      RcvDtl_PORelNum: 1,
      RcvDtl_PackLine: 1,
      RcvHead_PackSlip: "000097"
    }
    console.log({ formData })
    setSaved(true)
  }

  const onSearchPoChange = (text) => {
    setPoNum(text)
  }

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
                  // disabled: _.isEmpty(selectedPOdata),
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
                    <View style={globalStyles.dFlexR}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        onChangeText={onChangeSearchQuery}
                        value={vendorNameSearch || ""}
                        placeholder="Search by vendorname"
                      />
                      {/* <Pressable onPress={searchPoNum}>
                        {!isPosLoading ? (
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
                      </Pressable> */}
                    </View>
                    <View style={[globalStyles.dFlexR, globalStyles.justifySB, styles.poModalHeader]}>
                      <Text style={{ color: "white" }}>PoNum</Text>
                      <Text style={{ color: "white" }}>VendorNumName</Text>
                    </View>
                    {
                      isPosLoading ? <ActivityIndicator
                        animating={true}
                        color={MD2Colors.red800}
                      /> :
                        <ScrollView>
                          {filteredPos?.length > 0 ?
                            filteredPos?.map((po, id) => (
                              <View key={id}>
                                <TouchableOpacity onPress={() => onSelectPoNUm(po)}>
                                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                    <Text style={{ marginLeft: 10 }}>{po.PONum}</Text>
                                    <Text style={{ marginRight: 10 }}>{po.VendorName}</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            )) : <Text style={{ textAlign: "center", marginTop: 30 }}>No Data Found</Text>
                          }
                        </ScrollView>
                    }
                  </Modal>
                </Portal>
                <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                  <Text style={styles.inputLabel}>PO Num</Text>
                  <TouchableOpacity onPress={() => setShowPOModal(true)} >
                    <Text style={{ color: globalStyles.colors.primary, marginRight: 10 }}>Search POs</Text>
                  </TouchableOpacity>
                </View>
                <View style={globalStyles.dFlexR}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    onChangeText={onSearchPoChange}
                    value={poNum ? poNum?.toString() : ""}
                    editable={!loading}
                    placeholder="PO Num"
                    keyboardType="numeric"
                  />
                  <Pressable onPress={getPoReciept}>
                    {!loading ? (
                      <Feather name="search" size={24} color={globalStyles.colors.darkGrey} />
                    ) : (
                      <ActivityIndicator
                        animating={true}
                        color={MD2Colors.red800}
                      />
                    )}
                  </Pressable>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={openScanner}
                  >
                    <Text style={styles.closeButtonText}>
                      <AntDesign name="scan1" size={24} color={globalStyles.colors.darkGrey} />
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Supplier Name</Text>
                <Text
                  style={{ color: globalStyles.colors.darkGrey, margin: 10 }}
                >
                  {POData[0]?.VendorName || 'N/A'}
                </Text>
                <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                  <Text style={styles.inputLabel}>Packslip</Text>
                  {/* <TouchableOpacity onPress={() => {
                    if (isNewPackSlip) {
                      fetchPackslips();
                    } else {
                      setPackSlipData([]);
                      // setPOData([]);
                      // setSelectedPOdata({})
                      setPackSlipNUm("")
                      setIsNewpackslip(true)
                    }
                  }} >
                    <Text style={{ color: globalStyles.colors.primary, marginRight: 10 }}>{isNewPackSlip ? "Edit Existing Packslips" : "Enter New Packslip"}</Text>
                  </TouchableOpacity> */}
                </View>
                {
                  packslipLoading ? <ActivityIndicator
                    animating={true}
                    color={MD2Colors.red800}
                  /> :
                    packslipData.length > 0 && (
                      <View style={{ margin: 7, borderColor: globalStyles.colors.success, borderWidth: 1 }}>
                        <View style={[globalStyles.dFlexR, globalStyles.justifySB, styles.poModalHeader]}>
                          {/* <Text style={{ color: "white" }}>PoNum</Text> */}
                          <Text style={{ color: "white" }}>Packslip</Text>
                          <Text style={{ color: "white" }}>Vendor Name</Text>
                        </View>
                        <ScrollView>
                          {packslipData?.length > 0 ?
                            packslipData?.map((po, id) => (
                              <View key={id} style={{ padding: 2 }}>
                                <TouchableOpacity onPress={() => onSelectPackslip(po)}>
                                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                    <Text>{po.PackSlip}</Text>
                                    <Text>{po.VendorNumName}</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            ))
                            : <Text style={{ textAlign: "center", marginTop: 30 }}>No Data Found</Text>
                          }
                        </ScrollView>
                      </View>
                    )
                }
                <TextInput
                  style={styles.input}
                  // editable={!loading}
                  value={packSLipNUm}
                  onChangeText={(text) => setPackSlipNUm(text)}
                  placeholder="Packslip"
                />

                <TouchableOpacity
                  disabled={_.isEmpty(packSLipNUm)}
                  style={styles.receiveButton}
                  onPress={handleCreateUpdatePackSlip}
                >
                  <Text style={styles.receiveButtonText}>Create Packslip</Text>
                </TouchableOpacity>
                {/* <FAB
                  icon="plus"
                  style={styles.fab}
                  onPress={() => console.log('Pressed')}
                /> */}
              </View>
            )}
            {tabValue == '2' && (
              <View style={styles.tabView}>
                {/* <View>
                  <Text style={styles.inputLabel}>Filter</Text>
                  <TextInput
                    style={styles.input}
                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                    // value={formData?.confirm_password}
                    // secureTextEntry={true}
                    placeholder="Filter"
                  />
                </View> */}
                <View style={{ maxHeight: "80%" }}>
                  {/* <TouchableOpacity style={{ width: 120, alignSelf: "flex-end" }} onPress={() => setTabvalue("3")} >
                    <Text style={{ color: globalStyles.colors.primary, alignSelf: "flex-end" }}>+ Create New Line</Text>
                  </TouchableOpacity> */}
                  <ScrollView >

                    {packslipData && packslipData?.length > 0 ?
                      packslipData?.map((po) => (
                        <View key={po.PONum}>
                          <TouchableOpacity onPress={() => onSelectLine(po)}>
                            <View>
                              {/* <Text style={[styles.inputLabel, { color: 'black' }]}>
                                {po.PackId}
                              </Text> */}
                              {/* <Text style={{ paddingLeft: 10 }}>
                                {' '}
                                Entry Person: {po.EntryPerson}{' '}
                              </Text> */}
                              {/* <View
                                style={[
                                  globalStyles.dFlexR,
                                  globalStyles.justifySB,
                                  { fontSize: 13 },
                                ]}
                              > */}
                              <Text style={{ paddingLeft: 10, fontSize: 15, fontWeight: "600" }}>
                                Packslip: {po?.PackSlip || "N/A"}
                              </Text>
                              <Text style={{ paddingHorizontal: 10, fontSize: 13 }}>
                                Line : {po?.POLine || "N/A"},
                                Rel: {po?.PORelNum || "N/A"},
                                Part: {po.POLinePartNum || "N/A"}
                              </Text>
                              {/* </View> */}
                            </View>
                          </TouchableOpacity>
                        </View>
                      )) : <Text style={{ textAlign: "center" }}>No Lines Found</Text>}
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
                        {currentLine.PONum || 'N/A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Line</Text>
                      <Text style={{ padding: 10 }}>
                        {currentLine.POLine || 'N/A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>Rel</Text>
                      <Text style={{ padding: 10 }}>
                        {selectedPOdata.PORel || 'N/A'}
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
                      {/* <TextInput
                        style={styles.input}
                        onChangeText={(text) => onChangeText(text, 'arrived_qty')}
                        value={currentLine.PORelArrivedQty && Math.round(currentLine.PORelArrivedQty)?.toString()}
                        placeholder="Arrived qty"
                      /> */}
                    </View>
                  </View>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Input</Text>
                      <TextInput
                        style={styles.input}
                        onChangeText={(text) => onChangeText(text, 'input')}
                        value={formData?.InputOurQty || currentLine?.InputOurQty && Math.round(currentLine?.InputOurQty)?.toString()}
                        placeholder="Input"
                      />
                    </View>
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
                      onChangeText={(text) => onChangeText(text, 'note')}
                      value={formData?.note}
                      multiline={true}
                      placeholder="Note"
                    />
                  </View>
                  <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Warehouse Code</Text>
                      {/* <TextInput
                        style={styles.input}
                        onChangeText={(text) => onChangeText(text, 'WareHouseCode')}
                        value={formData?.WareHouseCode || currentLine?.WareHouseCode || "-"}
                        placeholder="Warehouse Code"
                      /> */}
                      <RNPickerSelect
                        onValueChange={(text) => onChangeText(text, 'WareHouseCode')}
                        items={renderWarehouseOptions(warehouseCodes)}
                        placeholder={{
                          label: 'WareHouseCode',
                          value: null,
                        }}
                        value={formData?.WareHouseCode}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Bin Number</Text>
                      {/* <TextInput
                        style={styles.input}
                        onChangeText={(text) => onChangeText(text, 'BinNum')}
                        value={currentLine?.BinNum}
                        placeholder="Bin Number"
                      /> */}
                      <RNPickerSelect
                        onValueChange={(text) => onChangeText(text, 'BinNum')}
                        items={renderBinOptions(bins)}
                        placeholder={{
                          label: 'BinNum',
                          value: null,
                        }}
                        value={formData?.BinNum}
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
                      onPress={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      buttonColor={globalStyles.colors.success}
                      icon="printer"
                      mode="contained"
                      // disabled={!saved}
                      onPress={() => setOpenBarcodeScreen(true)}
                    >
                      Print Tags
                    </Button>
                  </View>
                </ScrollView>
                {openBarcodescreen && (
                  <PrintBarcodeScreen
                    selectedPackSlip={selectedPackSlip}
                    openBarcodescreen={openBarcodescreen}
                    setOpenBarcodeScreen={setOpenBarcodeScreen} />
                )}
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
    height: 32,
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
