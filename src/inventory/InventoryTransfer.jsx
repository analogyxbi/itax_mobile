import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { globalStyles } from '../style/globalStyles';
import Transferbackdrop from '../components/Loaders/Transferbackdrop';
import SuccessBackdrop from '../components/Loaders/SuccessBackdrop';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearBinData,
  setInitialState,
  setWarehouses,
  setWhseBins,
} from './reducer/inventory';
import { Button } from 'react-native-paper';
import { showSnackbar } from '../Snackbar/messageSlice';
import ErrorBackdrop from '../components/Loaders/ErrorBackdrop';
import PopUpDialog from '../components/PopUpDialog';
import Icon from '../components/Icons';
import { generatTransferPDF, generatePDF } from '../utils/PDFGenerator';
import { BarCodeScanner } from 'expo-barcode-scanner';
import BarcodeScannerComponent from '../components/BarcodeScannerComponent';
import SelectInput from '../components/SelectInput';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from '../components/Loaders/toastReducers';
import getClientErrorMessage from '../utils/getClientErrorMessage';

const initForm = {
  current_whse: null,
  current_bin: null,
  quantity: 0,
  to_whse: null,
  to_bin: null,
};

const InventoryTransfer = () => {
  const { warehouses, binsData } = useSelector((state) => state.inventory);
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const dispatch = useDispatch();
  const [current, setCurrent] = useState({});
  const [target, setTarget] = useState({});
  const navigation = useNavigation();
  const animationRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPart, setSelectedPart] = useState({});
  const [error, setError] = useState({});
  const [bins, setBins] = useState({
    from: [],
    to: [],
  });
  const [formData, setFormData] = useState({});
  const restartAnimation = () => {
    animationRef.current?.restartAnimation();
  };
  const [currentParts, setCurrentParts] = useState([]);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [enablePrint, setEnablePrint] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [lastScannedTime, setLastScannedTime] = useState(null);
  const [cameraState, setCameraState] = useState(null);

  const openScanner = () => {
    setScannerVisible(true);
    setScanned(false);
  };
  const closeScanner = () => {
    setCameraState(null);
    setScannerVisible(false);
  };

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  function createPayload() {
    const currentDate = new Date();
    const InvTrans = [
      {
        Company: selectedPart.Company,
        TranDate: currentDate.toISOString(),
        FromWarehouseCode: formData.current_whse,
        // FromWarehouseCode: formData.current_whse,
        Plant: selectedPart.PlantName, // PlantName
        Plant2: selectedPart.Plant, // Plant
        ToWarehouseCode: formData.to_whse,
        FromBinNum: formData.current_bin,
        ToBinNum: formData.to_bin,
        PartNum: selectedPart.PartNum,
        TransferQty: formData.quantity,
        TransferQtyUOM: selectedPart.IUM,
        ToOnHandUOM: selectedPart.IUM,
        TrackingUOM: selectedPart.IUM,
        RowMod: 'A',
      },
    ];
    const Parts = [
      {
        Company: selectedPart.Company,
        PartNum: selectedPart.PartNum,
        RowMod: 'U',
      },
    ];

    return {
      ds: {
        InvTrans: InvTrans,
        Parts: Parts,
      },
    };
  }

  function initiateTransfer() {
    setSubmitConfirm(false);
    if (formData.quantity <= 0 || selectedPart.QtyOnHand <= formData.quantity) {
      return dispatch(showSnackbar('Error setting Quantity'));
    }

    dispatch(
      setIsLoading({
        value: true,
        message: 'Stock Transfer in Progess. Please wait',
      })
    );
    const data = createPayload();
    const epicor_endpoint = `/Erp.BO.InvTransferSvc/CommitTransfer`;
    const postPayload = {
      epicor_endpoint,
      request_type: 'POST',
      data: JSON.stringify(data),
    };
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          dispatch(
            setOnSuccess({ value: true, message: 'Stock Transfer Success' })
          );
          setSelectedPart((prev) => ({
            ...prev,
            QtyOnHand: prev.QtyOnHand - parseInt(formData.quantity),
          }));
          // setFormData({});
          setEnablePrint(true);
        })
        .catch((err) => {
          // console.log('Stock Transfer failed');
          // console.log({ err });
          // // dispatch(showSnackbar('Error Occured'));
          // err.json().then((res) => {
          //   dispatch(setOnError({ value: true, message: res.error }));
          //   console.log({ response });
          // });
          getClientErrorMessage(err).then(({ message }) => {
            dispatch(
              setOnError({
                value: true,
                message: message,
              })
            );
          });
        });
    } catch (err) {
      dispatch(setOnError({ value: true, message: '✗ An Error Occured' }));
    }
  }

  function fetchPartDetails(data) {
    setRefreshing(true);
    const epicor_endpoint = `/Erp.BO.PartBinSearchSvc/GetBinContents`;
    const postPayload = {
      epicor_endpoint,
      request_type: 'POST',
      data: JSON.stringify(data),
    };

    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          const part = json.data.returnObj.PartBinSearch;
          setCurrentParts(() => [...part]);
          setRefreshing(false);
          dispatch(
            showSnackbar(
              `Parts fetched for warehouse ${data.whseCode} and bin ${data.binNum}`
            )
          );
        })
        .catch((err) => {
          // setLoading(false);
          setRefreshing(false);
          dispatch(
            showSnackbar(
              `Error fetching Parts for warehouse ${data.whseCode} and bin ${data.binNum}`
            )
          );
          setRefreshing(false);
        });
    } catch (err) {
      dispatch(
        showSnackbar(
          `Error fetching Parts for warehouse ${data.whseCode} and bin ${data.binNum}`
        )
      );
    }
  }

  useEffect(() => {
    if (formData.current_whse && formData.current_bin) {
      fetchPartDetails({
        whseCode: formData.current_whse,
        binNum: formData.current_bin,
      });
    }
  }, [formData.current_whse, formData.current_bin]);

  function getBins(to, warehouse) {
    setRefreshing(true);
    const filter = encodeURI(`WarehouseCode eq '${warehouse}'`);
    const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins?$select=WarehouseCode,BinNum&$filter=${filter}`;
    const postPayload = {
      epicor_endpoint,
      request_type: 'GET',
    };

    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          setBins((prev) => ({ ...prev, [to]: json.data.value }));
          dispatch(showSnackbar(`Bins fetched for ${warehouse}`));
          dispatch(setWhseBins({ warehouse, bins: json.data.value }));
          setRefreshing(false);
        })
        .catch((err) => {
          // setLoading(false);
          setRefreshing(false);
          dispatch(
            showSnackbar(
              'Error getting the list of warehouses',
              JSON.stringify(err)
            )
          );
          setRefreshing(false);
        });
    } catch (err) {
      dispatch(
        showSnackbar(
          'Error getting the list of warehouses',
          JSON.stringify(err)
        )
      );
    }
  }

  function getWarehouse() {
    setRefreshing(true);

    const postPayload = {
      epicor_endpoint:
        '/Erp.BO.WarehseSvc/Warehses?$select=WarehouseCode,Name,Description',
      request_type: 'GET',
    };
    try {
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          dispatch(setWarehouses(json.data.value));
          setRefreshing(false);
          dispatch(showSnackbar('Warehouse List refreshed'));
        })
        .catch((err) => {
          // setLoading(false);
          setRefreshing(false);
          dispatch(
            showSnackbar(
              'Error getting the list of warehouses',
              JSON.stringify(err)
            )
          );
        });
    } catch (err) {
      dispatch(
        showSnackbar(
          'Error getting the list of warehouses',
          JSON.stringify(err)
        )
      );
    }
  }

  useEffect(() => {
    if (warehouses.length == 0) {
      getWarehouse();
    }
  }, []);

  function onSelectWarehouse(value, key) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  function onSelectTarget(value, key) {
    setTarget((prev) => ({ ...prev, [key]: value }));
  }

  function onSelectBins(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleValidate() {
    if (
      !formData ||
      !formData.current_whse ||
      !formData.current_bin ||
      !formData.to_whse ||
      !formData.to_bin ||
      !formData.quantity ||
      formData.quantity == 0
    ) {
      return true;
    }
    return false;
  }

  function captureDetails(details, state) {
    if (
      cameraState === 'current_part' &&
      (!formData.current_whse ||
        !formData.current_bin ||
        formData.current_whse === '' ||
        formData.current_bin === '')
    ) {
      setCameraState(null);
      closeScanner();
      return dispatch(
        showSnackbar('Warehouse or bin not found for the part number')
      );
    }
    if (details.includes('\\')) {
      const data = details.split(' \\ ');
      if (data.length > 0 && data.length <= 3) {
        if (state.startsWith('current')) {
          setFormData((prev) => ({
            ...prev,
            current_whse: data[0],
            current_bin: data[1],
          }));
        } else if (state.startsWith('to')) {
          setFormData((prev) => ({
            ...prev,
            to_whse: data[0],
            to_bin: data[1],
          }));
        }
      }
      dispatch(showSnackbar('Mismatch data type'));
    } else {
      setFormData((prev) => ({ ...prev, [state]: details }));
    }
    setCameraState(null);
    closeScanner();
  }

  function handleOptionsRefresh(name) {
    switch (name) {
      case 'current_whse':
        getWarehouse();
        break;
      case 'current_bin':
        if (formData.current_whse) {
          getBins('from', formData.current_whse);
        }
        break;
      case 'to_whse':
        getWarehouse();
        break;
      case 'to_bin':
        if (formData.to_whse) {
          getBins('to', formData.to_whse);
        }
        break;
      case 'current_part':
        if (formData.current_whse && formData.current_bin) {
          fetchPartDetails({
            whseCode: formData.current_whse,
            binNum: formData.current_bin,
          });
        }
      default:
        break;
    }
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
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Inventory Transfer</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            title={'Please wait'}
            refreshing={refreshing}
            onRefresh={() => {
              // setFormData({});
              // dispatch(setInitialState());
              // setCurrentParts([]);
              // getWarehouse();
            }}
          />
        }
      >
        <View style={styles.container}>
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
          {/* <View
            style={[globalStyles.dFlexR, { justifyContent: 'flex-end' }]}
          ></View> */}
          <View
            style={[
              globalStyles.dFlexR,
              globalStyles.justifySB,
              { marginBottom: 20 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={globalStyles.dFlexR}>
                <Text style={styles.inputLabel}>Current Warehouse </Text>
                <TouchableOpacity
                  onPress={() => {
                    setCameraState('current_whse');
                    openScanner();
                  }}
                >
                  <AntDesign
                    name="scan1"
                    size={24}
                    color={globalStyles.colors.darkGrey}
                  />
                </TouchableOpacity>
              </View>
              <SelectInput
                value={formData.current_whse || null}
                onChange={(itemValue) => {
                  formData.current_bin = '';
                  formData.current_part = '';
                  onSelectBins('current_whse', itemValue);

                  if (!binsData[itemValue]) {
                    getBins('from', itemValue);
                  }
                }}
                options={warehouses.map((data) => ({
                  ...data,
                  label: data.WarehouseCode,
                  value: data.WarehouseCode,
                }))}
                isLoading={refreshing}
                label="current_whse"
                handleRefresh={handleOptionsRefresh}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={globalStyles.dFlexR}>
                <Text style={styles.inputLabel}>Current Bin </Text>
                <TouchableOpacity
                  onPress={() => {
                    setCameraState('current_bin');
                    openScanner();
                  }}
                >
                  <AntDesign
                    name="scan1"
                    size={24}
                    color={globalStyles.colors.darkGrey}
                  />
                </TouchableOpacity>
              </View>
              <SelectInput
                value={formData.current_bin}
                onChange={(itemValue) => {
                  formData.current_part = '';
                  onSelectBins('current_bin', itemValue);
                }}
                options={
                  binsData[formData?.current_whse]?.map((data) => ({
                    ...data,
                    label: data.BinNum,
                    value: data.BinNum,
                  })) || []
                }
                isLoading={refreshing}
                handleRefresh={handleOptionsRefresh}
                label="current_bin"
              />
            </View>
          </View>
          <View>
            <View style={globalStyles.dFlexR}>
              <Text style={styles.inputLabel}>Select Part </Text>
              <TouchableOpacity
                onPress={() => {
                  setCameraState('current_part');
                  openScanner();
                }}
              >
                <AntDesign
                  name="scan1"
                  size={24}
                  color={globalStyles.colors.darkGrey}
                />
              </TouchableOpacity>
            </View>
            <SelectInput
              value={formData.current_part}
              onChange={(itemValue) => {
                onSelectBins('current_part', itemValue);
                const stock = currentParts.find(
                  (data) => data.PartNum === itemValue
                );
                if (stock) {
                  setSelectedPart(stock);
                }
              }}
              options={currentParts.map((data) => ({
                ...data,
                label: data.PartNum,
                value: data.PartNum,
              }))}
              isLoading={refreshing}
              label="current_part"
              handleRefresh={handleOptionsRefresh}
            />
          </View>
          <Text
            style={{
              margin: 10,
              marginTop: 30,
              color: globalStyles.colors.darkGrey,
            }}
          >
            Stock: # {selectedPart ? selectedPart.QtyOnHand : ''}
          </Text>
          <View>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(text) => {
                onSelectBins('quantity', text);
                if (selectedPart && selectedPart.QtyOnHand < parseInt(text)) {
                  setError((prev) => ({
                    ...prev,
                    quantity:
                      'Quantity Must be less than or equal to the QtyOnHand',
                  }));
                } else {
                  setError((prev) => ({
                    ...prev,
                    quantity: '',
                  }));
                }
                if (!selectedPart) {
                  setError((prev) => ({
                    ...prev,
                    quantity: 'Part Not Found',
                  }));
                }
              }}
              value={formData?.quantity}
              placeholder="Enter Quantity here"
            />
            {error?.quantity ? (
              <Text style={styles.errorText}>{error.quantity}</Text>
            ) : null}
          </View>
          <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
            <View style={{ flex: 1 }}>
              <View style={globalStyles.dFlexR}>
                <Text style={styles.inputLabel}>To Warehouse</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCameraState('to_whse');
                    openScanner();
                  }}
                >
                  <AntDesign
                    name="scan1"
                    size={24}
                    color={globalStyles.colors.darkGrey}
                  />
                </TouchableOpacity>
              </View>

              <SelectInput
                value={formData.to_whse}
                onChange={(itemValue) => {
                  onSelectBins('to_whse', itemValue);
                  formData.tobin = '';
                  if (!binsData[itemValue]) {
                    getBins('to', itemValue);
                  }
                }}
                options={warehouses.map((data) => ({
                  ...data,
                  label: data.WarehouseCode,
                  value: data.WarehouseCode,
                }))}
                isLoading={refreshing}
                label="to_whse"
                handleRefresh={handleOptionsRefresh}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={globalStyles.dFlexR}>
                <Text style={styles.inputLabel}>To Bin</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCameraState('to_bin');
                    openScanner();
                  }}
                >
                  <AntDesign
                    name="scan1"
                    size={24}
                    color={globalStyles.colors.darkGrey}
                  />
                </TouchableOpacity>
              </View>
              <SelectInput
                value={formData.to_bin}
                onChange={(itemValue) => {
                  onSelectBins('to_bin', itemValue);
                }}
                options={
                  binsData[formData?.to_whse]?.map((data) => ({
                    ...data,
                    label: data.BinNum,
                    value: data.BinNum,
                  })) || []
                }
                isLoading={refreshing}
                label="to_bin"
                handleRefresh={handleOptionsRefresh}
              />
            </View>
          </View>
          <PopUpDialog
            visible={submitConfirm}
            setVisible={setSubmitConfirm}
            handleCancel={() => setSubmitConfirm(false)}
            handleOk={initiateTransfer}
            title="Transfer Stock"
            message={'Are you sure you want to tranfer the stock?'}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          buttonColor={globalStyles.colors.success}
          icon="transfer"
          mode="contained"
          onPress={() => setSubmitConfirm(true)}
          // disabled={handleValidate()}
        >
          Transfer
        </Button>
        <Button
          buttonColor={globalStyles.colors.success}
          icon="printer"
          mode="contained"
          disabled={false}
          onPress={() => generatTransferPDF(formData, currentParts)}
        >
          Print Tags
        </Button>
      </View>
    </View>
  );
};

export default InventoryTransfer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: globalStyles.colors.grey,
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
    margin: 10,
    flex: 1,
  },
  receiveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
    marginBottom: 7,
  },
  footer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
