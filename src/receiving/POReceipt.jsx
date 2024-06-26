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
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  FlatList,
} from 'react-native';
import {
  Button,
  Checkbox,
  Portal,
  SegmentedButtons,
  Modal,
  FAB,
} from 'react-native-paper';
import { globalStyles } from '../style/globalStyles';
import { BarCodeScanner } from 'expo-barcode-scanner';
import getClientErrorObject from '../utils/getClientErrorObject';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';
import CustomDatatable from '../components/CustomDatatable';
import LinesCard from './components/LinesCard';
import { setPOdataResponse } from './reducer/poReceipts';
import SuccessBackdrop from '../components/Loaders/SuccessBackdrop';
import ErrorBackdrop from '../components/Loaders/ErrorBackdrop';
import Transferbackdrop from '../components/Loaders/Transferbackdrop';
import ExpoCamera from '../components/Camera';
import BarcodeScannerComponent from '../components/BarcodeScannerComponent';
import * as ImagePicker from 'expo-image-picker';
import AttachedImage from '../components/AttachedImage';
import LineComponent from './components/LineComponent';
import ImagePreview from '../components/ImagePreview';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from '../components/Loaders/toastReducers';
import getClientErrorMessage from '../utils/getClientErrorMessage';

const initialFormdata = {
  poNum: '',
  packslip: '',
  supplier_name: '',
  line: '',
  rel: '',
  order_qty: '',
  arrived_qty: '',
  input: '',
  note: '',
  WareHouseCode: '',
  BinNum: '',
};

const POReceipt = () => {
  const { podata } = useSelector((state) => state.poReceipts);
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [localPoData, setLocalPoData] = useState({ 1: podata });
  const [hasPermission, setHasPermission] = useState(null);
  const [warehouseCodes, setWarehouseCodes] = useState([]);
  const [isNewPackSlip, setIsNewpackslip] = useState(true);
  const [createPackslipLoading, setCreatepackslipLoading] = useState(false);
  const navigation = useNavigation();
  const [tabValue, setTabvalue] = useState('1');
  const [cameraState, setCameraState] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [poNum, setPoNum] = useState();
  const [loading, setLoading] = useState(false);
  const [POData, setPOData] = useState([]);
  const [packSLipNUm, setPackSlipNUm] = useState('');
  const [packslipData, setPackSlipData] = useState([]);
  const [selectedPackSlip, setSelectedPackslip] = useState({});
  const [packslipLoading, setPackslipLoading] = useState(false);
  const [isPosLoading, setIsPOsLoading] = useState(false);
  const [selectedPOdata, setSelectedPOdata] = useState({});
  const [existingPackslips, setExistingPackSlips] = useState([]);
  const [existingPackslipLoading, setExistingPackslipLoading] = useState(false);
  const [currentLine, setCurrentLine] = useState({});
  const [showPOModal, setShowPOModal] = useState(false);
  const [formData, setFormdata] = useState(initialFormdata);
  const [saved, setSaved] = useState(false);
  const [bins, setBins] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [openBarcodescreen, setOpenBarcodeScreen] = useState(false);
  const [customTableState, setCustomTableState] = useState({
    page: 1,
    totalPages: 1000,
    limit: 100,
  });
  const [whseBin, setWhseBin] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImagePress = (imageBase64) => {
    setPreviewImage(imageBase64);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

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

  const renderWarehouseOptions = (values) => {
    const result = values.map((val) => ({
      ...val,
      label: val.WarehouseCode,
      value: val.WarehouseCode,
    }));
    return result;
  };

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
    setLocalPoData({});
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
    setPOData([]);
    setPackSlipData([]);
    setPackSlipNUm('');
    setExistingPackSlips([]);
    setIsNewpackslip(true);
    // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$expand=RcvDtls`;
    // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$select=PackSlip,Company,PORel,ShipViaCode,PONum,RcvDtls/BinNum,RcvDtls/PONum,RcvDtls/POLine,RcvDtls/PackLine,RcvDtls/WareHouseCode,VendorNumName&$expand=RcvDtls`;
    if (poNum) {
      // let filterQuery = encodeURI(`PONum eq ${poNum}`);
      // epicor_endpoint = epicor_endpoint + `&$filter=${filterQuery}`
      // const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$filter=PONum eq ${poNum}`
      const epicor_endpoint = `/Erp.BO.POSvc/POes?$filter=PONum eq ${poNum}&$expand=PODetails`;
      // const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$select=PackSlip,Company,PORel,ShipViaCode,PONum,RcvDtls/BinNum,RcvDtls/PONum,RcvDtls/POLine,RcvDtls/PackLine,RcvDtls/WareHouseCode,VendorNumName&$expand=RcvDtls&$filter=PONum eq ${poNum}`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            if (json.data.value.length == 0) {
              dispatch(showSnackbar('PO Not Found'));
            } else {
              setPOData(() => json.data.value);
              console.log({ json });
            }
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(showSnackbar(message));
            });
          });
      } catch (err) {
        setLoading(false);
      }
    } else {
      dispatch(showSnackbar('Enter the PO Num first'));
      setLoading(false);
    }
  };

  const fetchExistingPackslips = () => {
    setExistingPackslipLoading(true);
    if (poNum) {
      setIsNewpackslip(false);
      const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$filter=PONum eq ${poNum}&$expand=RcvDtls&$select=PONum,PackSlip,RcvDtls`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            setExistingPackSlips(() => json.data.value);
            setExistingPackslipLoading(false);
            setIsNewpackslip(false);
          })
          .catch((err) => {
            setExistingPackslipLoading(false);
            setIsNewpackslip(true);
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(showSnackbar(message));
            });
          });
      } catch (err) {
        setExistingPackslipLoading(false);
        setIsNewpackslip(true);
      }
    } else {
      dispatch(showSnackbar('Enter the PO Num first'));
      setExistingPackslipLoading(false);
    }
  };

  const fetchPackslips = () => {
    setPackslipLoading(true);
    if (poNum) {
      // setIsNewpackslip(false);
      const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$filter=PONum eq ${poNum}`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            setPackSlipData(json.data.value);
            setPackslipLoading(false);
            // setIsNewpackslip(false);
          })
          .catch((err) => {
            setPackslipLoading(false);
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(showSnackbar(message));
            });
            // setIsNewpackslip(true);
          });
      } catch (err) {
        setPackslipLoading(false);
        // setIsNewpackslip(true);
      }
    } else {
      dispatch(showSnackbar('Enter the PO Num first'));
      setPackslipLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === '2' && isNewPackSlip) {
      fetchPackslips();
    }
  }, [tabValue]);

  const getWareHouseList = (warehouseCode) => {
    const filter = encodeURI(`WarehouseCode eq '${warehouseCode}'`);
    const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins?$select=WarehouseCode,BinNum&$filter=${filter}&$top=1000`;
    const postPayload = {
      epicor_endpoint,
      request_type: 'GET',
    };
    // if (poNum) {
    //   let filterQuery = encodeURI(`PONum eq ${poNum}`);
    //   epicor_endpoint.concat(`&$filter=${filterQuery}`);
    // }
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          setWarehouseCodes(() => json.data.value);
          setBins(() => json.data.value);
          // setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          getClientErrorMessage(err).then(({ message }) => {
            dispatch(showSnackbar(message));
          });
          // setLoading(false);
        });
    } catch (err) {
      // setLoading(false);
    }
  };
  const onChangeText = (val, name) => {
    setFormdata((form) => ({ ...form, [name]: val }));
    if (name === 'WareHouseCode') {
      const filteredWareHouse = warehouseCodes?.filter(
        (warehouse) => warehouse?.WarehouseCode === val
      );
      setBins(filteredWareHouse);
    }
    setSaved(false);
  };

  const handleCreateUpdatePackSlip = () => {
    if (!POData[0].Approve) {
      return dispatch(showSnackbar('PO is not Approved.'));
    }
    if (isNewPackSlip) {
      createPackSlip();
    } else {
      setTabvalue('2');
    }
  };

  const createPackSlip = () => {
    setCreatepackslipLoading(true);

    if (packSLipNUm) {
      // setIsNewpackslip(false);
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
        RowMod: 'A',
      };
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint,
            request_type: 'POST',
            data: JSON.stringify(postData),
          },
          stringify: false,
        })
          .then(({ json }) => {
            dispatch(showSnackbar('Packslip added succesfully'));
            setCreatepackslipLoading(false);
            setTabvalue('2');
          })
          .catch((err) => {
            dispatch(showSnackbar('Error adding the Packslip'));
            setCreatepackslipLoading(false);
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(showSnackbar(message));
            });
          });
      } catch (err) {
        setCreatepackslipLoading(false);
      }
    } else {
      dispatch(showSnackbar('Enter the Packslip first'));
      setCreatepackslipLoading(false);
    }
  };

  const searchPoNum = (page) => {
    let pageValue = page ? page : customTableState.page;
    if (_.isEmpty(localPoData[pageValue])) {
      setIsPOsLoading(true);
      // if (vendorNameSearch) {
      setIsNewpackslip(false);
      let epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$select=PONum,VendorName&$skip=${pageValue}&$top=${customTableState.limit}`;
      if (vendorNameSearch && vendorNameSearch.length > 0) {
        const str = encodeURI(`startswith(VendorName,${vendorNameSearch})`);
        epicor_endpoint.concat(`&$filter=${str}`);
      }
      // const epicor_endpoint = `/Erp.BO.PORelSearchSvc/PORelSearches?$filter=startswith(VendorName,${vendorNameSearch})`;
      try {
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: { epicor_endpoint, request_type: 'GET' },
          stringify: false,
        })
          .then(({ json }) => {
            dispatch(setPOdataResponse(json.data.value));
            setLocalPoData((prev) => ({
              ...prev,
              [pageValue]: json?.data?.value,
            }));
            setFilteredPos(json.data.value);
            3;

            setCustomTableState((prev) => ({
              ...prev,
              page: pageValue,
            }));
            setIsPOsLoading(false);
          })
          .catch((err) => {
            setIsPOsLoading(false);
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(showSnackbar(message));
            });
          });
      } catch (err) {
        setIsPOsLoading(false);
      }
    } else {
      setIsPOsLoading(true);
      setFilteredPos(localPoData[pageValue]);
      dispatch(setPOdataResponse(localPoData[pageValue]));
      setCustomTableState((prev) => ({
        ...prev,
        page: pageValue,
      }));
      setIsPOsLoading(false);
    }
    // } else {
    //   dispatch(showSnackbar('Enter the vendor name first'));
    //   setIsPOsLoading(false)
    // }
  };

  const onChangeSearchQuery = (val) => {
    setVendorNameSearch(val);
    if (val) {
      const filteredData = podata?.filter((data) =>
        data?.VendorName?.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredPos(filteredData);
    }
  };

  useEffect(() => {
    // getWareHouseList()
    if (showPOModal && _.isEmpty(localPoData)) {
      searchPoNum();
    }
  }, [showPOModal]);

  const onSelectPackslip = (po) => {
    setPackSlipNUm(po?.PackSlip);
    if (!isNewPackSlip) {
      setSelectedPackslip(po);
    }
  };

  const onSelectLine = (po) => {
    getWareHouseList(po?.WarehouseCode);
    const poDetails = (POData && POData[0]?.PODetails) || [];
    const selectedPo = poDetails.find((da) => da.POLine === po.POLine);
    if (isNewPackSlip && selectedPo) {
      setCurrentLine({
        ...po,
        DocUnitCost: selectedPo?.DocUnitCost,
        UnitCost: selectedPo?.UnitCost,
      });
    } else {
      setCurrentLine(po);
    }
    setTabvalue('3');
  };

  const handleSave = (reverse) => {
    dispatch(
      setIsLoading({ value: true, message: 'Saving the Receipt. Please wait' })
    );
    const today = new Date();
    let receipt = {
      // ...currentLine,
      Company: POData[0]?.Company,
      VendorNum: POData[0]?.VendorNum,
      PurPoint: '',
      PackSlip: packSLipNUm,
      ReceiptDate: today.toISOString(),
      Invoiced: false,
      PONum: POData[0]?.PONum,
      AutoReceipt: false,
      POType: POData[0]?.POType,
      Received: reverse,
      ReceivedTo: 'PUR-STK',
      ReceivedComplete: false,
      ArrivedDate: today.toISOString(),
      VendorQty: formData.input,
      PORelArrivedQty: formData?.input,
      POLine: currentLine?.POLine,
      PORelNum: currentLine?.PORelNum,
      PartNum: currentLine?.POLinePartNum,
      DocVendorUnitCost: currentLine.DocUnitCost
        ? currentLine.DocUnitCost
        : '0',
      DocUnitCost: currentLine.DocUnitCost ? currentLine.DocUnitCost : '0',
      VendorUnitCost: currentLine.UnitCost ? currentLine.UnitCost : '0',
      OurUnitCost: currentLine.UnitCost ? currentLine.UnitCost : '0',
      BinNum: formData?.BinNum,
      EnableBin: true,
      WareHouseCode: currentLine?.WarehouseCode,
      OurQty: formData.input,
      InputOurQty: formData.input,
      IUM: currentLine?.IUM,
      PUM: currentLine?.PUM,
      RowMod: !reverse ? 'U' : 'A',
    };
    if (currentLine.PackLine) {
      receipt.PackLine = currentLine.PackLine;
      receipt.WareHouseCode = currentLine?.WareHouseCode;
      receipt.BinNum = currentLine?.BinNum;
    }
    const postPayload = {
      Company: POData[0]?.Company,
      VendorNum: POData[0]?.VendorNum,
      PurPoint: '',
      PackSlip: packSLipNUm,
      ReceiptDate: today.toISOString(),
      SaveForInvoicing: true,
      Invoiced: false,
      RowMod: !reverse ? 'U' : 'A',
      ReceivePerson: 'analogyx1',
      RcvDtls: [receipt],
    };

    const epicor_endpoint = `/Erp.BO.ReceiptSvc/Receipts?$expand=RcvDtls`;
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify(postPayload),
      },
      stringify: false,
    })
      .then(({ json }) => {
        setSaved(true);
        dispatch(setOnSuccess({ value: true, message: '' }));
        setFormdata((prev) => ({ ...prev, BinNum: '', input: '' }));
      })
      .catch((err) => {
        getClientErrorObject(err).then((res) => {
          dispatch(showSnackbar(res.error));
        });
      });
  };

  const onSearchPoChange = (text) => {
    setPoNum(text);
  };

  function captureDetails(details, state) {
    if (details) {
      setPoNum(details);
    } else {
      dispatch(showSnackbar('Error fetching PO number'));
    }
    closeScanner();
  }

  const getCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera is required!');
    }
  };

  const captureImage = async () => {
    await getCameraPermission();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      // Do something with the captured image URI
      setAttachments((prev) => [...prev, ...result.assets]);
      // You may want to set the captured image URI to state or handle it in any way your application requires
    }
  };
  const removeImage = (indexToRemove) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };

  return (
    <SafeAreaView style={styles.container}>
      {scannerVisible ? (
        <View style={{ flex: 1 }}>
          <BarcodeScannerComponent
            closeScanner={closeScanner}
            captureDetails={captureDetails}
            // cameraState={cameraState}
          />
        </View>
      ) : cameraVisible ? (
        <ExpoCamera setCameraVisible={setCameraVisible} />
      ) : (
        <View>
          <Transferbackdrop
            loading={isLoading && !onSuccess}
            setLoading={(value) =>
              dispatch(setIsLoading({ value, message: '' }))
            }
          />
          <SuccessBackdrop
            visible={onSuccess}
            onDismiss={() => {
              setTimeout(() => {
                dispatch(setOnSuccess({ value: false, message: '' }));
                dispatch(setIsLoading({ value: false, message: '' }));
              }, 500);
            }}
          />
          <ErrorBackdrop
            visible={onError}
            onDismiss={() => {
              setTimeout(() => {
                dispatch(setOnError({ value: false, message: '' }));
                dispatch(setIsLoading({ value: false, message: '' }));
              }, 500);
            }}
          />

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
                  disabled: _.isEmpty(packSLipNUm) || _.isEmpty(POData),
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
                  disabled: _.isEmpty(currentLine),
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
                  <Modal
                    visible={showPOModal}
                    onDismiss={() => setShowPOModal(false)}
                    contentContainerStyle={styles.poModalContainer}
                  >
                    {/* <KeyboardAvoidingView
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform
                      style={{ flex: 1 }}
                    > */}
                    <View style={globalStyles.dFlexR}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        onChangeText={onChangeSearchQuery}
                        value={vendorNameSearch || ''}
                        placeholder="Search by vendorname"
                      />
                      <Pressable>
                        {!isPosLoading ? (
                          <Ionicons
                            name="search"
                            size={24}
                            color={globalStyles.colors.darkGrey}
                            onPress={searchPoNum}
                          />
                        ) : (
                          <ActivityIndicator
                            animating={true}
                            color={MD2Colors.red800}
                          />
                        )}
                      </Pressable>
                    </View>
                    {/* </KeyboardAvoidingView> */}
                    <CustomDatatable
                      data={filteredPos.filter((o) =>
                        o.VendorName.includes(vendorNameSearch)
                      )}
                      columnHeaders={['PONum', 'VendorName']}
                      page={customTableState.page}
                      onPageChange={(value) => {
                        searchPoNum(value);
                      }}
                      onRowPress={(value) => {
                        setPoNum(value.PONum);
                        setShowPOModal(false);
                      }}
                      loading={isPosLoading}
                    />
                  </Modal>
                </Portal>
                <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                  <Text style={styles.inputLabel}>PO Num</Text>
                  <TouchableOpacity onPress={() => setShowPOModal(true)}>
                    <Text
                      style={{
                        color: globalStyles.colors.primary,
                        marginRight: 10,
                      }}
                    >
                      Search POs
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={globalStyles.dFlexR}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    onChangeText={onSearchPoChange}
                    value={poNum ? poNum?.toString() : ''}
                    editable={!loading}
                    placeholder="PO Num"
                    keyboardType="numeric"
                  />
                  <Pressable onPress={getPoReciept}>
                    {!loading ? (
                      <Feather
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
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      openScanner();
                    }}
                  >
                    <Text style={styles.closeButtonText}>
                      <AntDesign
                        name="scan1"
                        size={24}
                        color={globalStyles.colors.darkGrey}
                      />
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
                  <TouchableOpacity
                    disabled={_.isEmpty(POData)}
                    onPress={() => {
                      if (isNewPackSlip) {
                        fetchExistingPackslips();
                      } else {
                        // setPackSlipData([]);
                        setSelectedPackslip({});
                        // setPOData([]);
                        // setSelectedPOdata({})
                        setPackSlipNUm('');
                        setIsNewpackslip(true);
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: globalStyles.colors.primary,
                        marginRight: 10,
                      }}
                    >
                      {isNewPackSlip
                        ? 'Edit Existing Packslips'
                        : 'Enter New Packslip'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {existingPackslipLoading ? (
                  <ActivityIndicator
                    animating={true}
                    color={MD2Colors.red800}
                  />
                ) : (
                  existingPackslips.length > 0 &&
                  !isNewPackSlip && (
                    <View
                      style={{
                        margin: 7,
                        borderColor: globalStyles.colors.success,
                        borderWidth: 1,
                      }}
                    >
                      <View
                        style={[
                          globalStyles.dFlexR,
                          globalStyles.justifySB,
                          styles.poModalHeader,
                        ]}
                      >
                        <Text style={{ color: 'white' }}>Packslip</Text>
                        <Text style={{ color: 'white' }}>
                          Available Pack Lines
                        </Text>
                      </View>
                      <ScrollView style={{ maxHeight: 200, padding: 5 }}>
                        {existingPackslips?.length > 0 ? (
                          existingPackslips?.map((po, id) => (
                            <View
                              key={id}
                              style={{
                                padding: 2,
                                backgroundColor:
                                  po.PackSlip == selectedPackSlip.PackSlip
                                    ? '#d9d9d9'
                                    : 'white',
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => onSelectPackslip(po)}
                              >
                                <View
                                  style={[
                                    globalStyles.dFlexR,
                                    globalStyles.justifySB,
                                  ]}
                                >
                                  <Text>{po.PackSlip}</Text>
                                  <Text>{po?.RcvDtls?.length} PackLines</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          ))
                        ) : (
                          <Text style={{ textAlign: 'center', marginTop: 30 }}>
                            No Data Found
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  )
                )}
                <TextInput
                  style={styles.input}
                  editable={isNewPackSlip && !_.isEmpty(POData)}
                  value={packSLipNUm}
                  onChangeText={(text) => setPackSlipNUm(text)}
                  placeholder="Packslip"
                />

                {createPackslipLoading ? (
                  <ActivityIndicator />
                ) : (
                  <TouchableOpacity
                    disabled={_.isEmpty(packSLipNUm) || _.isEmpty(POData)}
                    style={styles.receiveButton}
                    onPress={() => handleCreateUpdatePackSlip()}
                  >
                    <Text style={styles.receiveButtonText}>
                      {isNewPackSlip ? 'Create Packslip' : 'Edit PackSlip'}
                    </Text>
                  </TouchableOpacity>
                )}
                <View
                  style={{
                    width: 200,
                    alignSelf: 'flex-end',
                    paddingHorizontal: 10,
                  }}
                >
                  <Button
                    type="text"
                    // buttonColor={globalStyles.colors.primary}
                    mode="outlined"
                    // icon="camera"
                    // disabled={currentLine.ArrivedQty !== currentLine.XRelQty}
                    onPress={captureImage}
                  >
                    Upload Document
                  </Button>
                </View>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <ScrollView horizontal={true} style={styles.scrollView}>
                    {attachments.map((item, index) => (
                      <TouchableOpacity
                        onPress={() => handleImagePress(item.base64)}
                      >
                        <AttachedImage
                          key={index}
                          imageBase64={item.base64}
                          onRemove={() => removeImage(index)}
                          handleImagePress={() => {}}
                        />
                      </TouchableOpacity>
                    ))}
                    {previewImage && (
                      <ImagePreview
                        imageBase64={previewImage}
                        onClose={handleClosePreview}
                      />
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
            {tabValue == '2' && (
              <View style={styles.tabView}>
                {!_.isEmpty(selectedPackSlip) ? (
                  <View style={{ height: '100%' }}>
                    {/* <TouchableOpacity style={{ width: 120, alignSelf: "flex-end" }} onPress={fetchExistingPackslips} >
                      <Text style={{ color: globalStyles.colors.primary, alignSelf: "flex-end" }}>Refresh</Text>
                    </TouchableOpacity> */}
                    <ScrollView>
                      {existingPackslipLoading && (
                        <ActivityIndicator
                          animating={true}
                          color={MD2Colors.red800}
                        />
                      )}
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          marginBottom: 8,
                        }}
                      >
                        Packslip: {packSLipNUm}
                      </Text>
                      {selectedPackSlip &&
                      selectedPackSlip?.RcvDtls?.length > 0 ? (
                        selectedPackSlip?.RcvDtls?.map((po) => (
                          <LinesCard
                            data={po}
                            onSelectLine={onSelectLine}
                            isPackLine={true}
                          />
                        ))
                      ) : (
                        <Text style={{ textAlign: 'center' }}>
                          {existingPackslipLoading
                            ? 'Please wait'
                            : 'No Lines Found'}
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={{ height: '100%' }}>
                    <ScrollView>
                      {packslipLoading && (
                        <ActivityIndicator
                          animating={true}
                          color={MD2Colors.red800}
                        />
                      )}
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          marginBottom: 8,
                        }}
                      >
                        Packslip: {packSLipNUm}
                      </Text>
                      {packslipData && packslipData?.length > 0 ? (
                        packslipData?.map((po) => (
                          <LinesCard
                            data={po}
                            onSelectLine={onSelectLine}
                            isPackLine={false}
                          />
                        ))
                      ) : (
                        <Text style={{ textAlign: 'center' }}>
                          {packslipLoading ? 'Please wait' : 'No Lines Found'}
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
            {tabValue == '3' && (
              <View style={styles.tabView}>
                <LineComponent
                  {...{
                    styles,
                    currentLine,
                    formData,
                    handleSave,
                    bins,
                    onChangeText,
                    isNewPackSlip,
                  }}
                />
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
    fontSize: 22,
    fontWeight: '600',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  scrollView: {
    flexDirection: 'row',
    margin: 10,
    width: '100%',
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
    zIndex: 10,
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
    overflow: 'scroll',
    borderRadius: 8,
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
  reverse: {
    backgroundColor: globalStyles.colors.primary,
    padding: 3,
    width: 80,
    alignSelf: 'flex-end',
    borderRadius: 50,
    marginVertical: 10,
  },
});

export default POReceipt;
