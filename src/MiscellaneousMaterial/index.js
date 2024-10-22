import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, TouchableOpacity } from "react-native";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Linking,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { globalStyles } from "../style/globalStyles";
import { ActivityIndicator, Divider, MD2Colors } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import SelectInput from "../components/SelectInput";
import {
  fetchOnePartDetailsApi,
  fetchPartDetailsApi,
  fetchReasons,
} from "../QuantityAdjustments/utils";
import { showSnackbar } from "../Snackbar/messageSlice";
import SelectInputValue from "../components/SelectInputValue";
import {
  callIssueReturnGetNewPartNum,
  fetchGlobalReasons,
  setGlobalReasons,
} from "../QuantityAdjustments/materialSlice";
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from "../components/Loaders/toastReducers";
import Transferbackdrop from "../components/Loaders/Transferbackdrop";
import SuccessBackdrop from "../components/Loaders/SuccessBackdrop";
import ErrorBackdrop from "../components/Loaders/ErrorBackdrop";
import { AnalogyxBIClient } from "@analogyxbi/connection";
import PopUpDialog from "../components/PopUpDialog";
import BarcodeScannerComponent from "../components/BarcodeScannerComponent";
import AsyncPartSelect from "../components/AsyncPartSelect";
import { getPartNums } from "../utils/utils";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MiscellaneousMaterial = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [partNum, setPartNum] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [binwithPart, setBinwithpart] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [partDetails, setPartdetails] = useState();
  const [partSpecification, setPartSpecification] = useState();
  const [selectedBin, setSelectedBin] = useState({});
  const [confirmAdjust, setConfirmAdjust] = useState(false)
  const [reasons, setReasons] = useState([]);
  const { globalReasons, getNewPartNum } = useSelector(
    (state) => state.material
  );

  const openScanner = () => {
    setScannerVisible(true);
  };
  const closeScanner = () => {
    setScannerVisible(false);
  };

  const onChangeDate = (event) => {
    setShowPicker(false);
    const pickedDate = new Date(event?.nativeEvent?.timestamp);
    setDate(pickedDate);
  };
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const fetchPartDetails = async (partNum) => {
    setFormData({});
    setPartdetails({});
    setSelectedBin({});
    setBinwithpart([]);
    setPartSpecification({});
    try {
      setLoading(true);
      const partDetailResponse = await fetchPartDetailsApi(partNum);
      setPartdetails(partDetailResponse);
      const partData = await fetchOnePartDetailsApi(partNum);
      setPartSpecification(partData.data?.value[0]);
      dispatch(callIssueReturnGetNewPartNum(partNum));
    } catch (error) {
      dispatch(showSnackbar("Error fetching part details"));
    } finally {
      setLoading(false);
    }
  };
  const handleSelectWarehouse = (itemValue) => {
    const binlist = partDetails?.data?.returnObj?.PartOnHandBin?.filter(
      (bin) => bin.WarehouseCode == itemValue
    );
    setBinwithpart(binlist);
    setFormData((prev) => ({ ...prev, WareHouseCode: itemValue }));
  };

  const handleSelectReason = (val) => {
    setFormData((prev) => ({
      ...prev,
      reasonValue: val?.value,
      reasonCode: val?.ReasonCode,
      reasonType: val?.ReasonType,
    }));
  };

  const onSelectBin = (val) => {
    setFormData((prev) => ({ ...prev, ...val }));
    setSelectedBin(val);
  };

  const handleChange = (val, name) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  function captureDetails(details, state) {
    if (details) {
      setPartNum(details);
      fetchPartDetails(details);
    } else {
      dispatch(showSnackbar('Error fetching Part number'));
    }
    closeScanner();
  }

  const perFromMeaterialMovement = async (payload) => {
    try {
      const epicor_endpoint1 = `/Erp.BO.IssueReturnSvc/PrePerformMaterialMovement`;
      const postPayload1 = {
        epicor_endpoint: epicor_endpoint1,
        request_type: 'POST',
        data: JSON.stringify({
          plNegQtyAction: false,
          ds: {
            IssueReturn: payload?.ds?.IssueReturn
          }
        })
      }
      const response1 = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: postPayload1,
        stringify: false,
      })
      const epicor_endpoint = `/Erp.BO.IssueReturnSvc/PerformMaterialMovement`;
      const postPayload = {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify({
          plNegQtyAction: false,
          ds: response1?.json?.data?.parameters?.ds
        })
      }
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
      dispatch(setOnSuccess({ value: true, message: 'Part issued.' }))
      setFormData({});
      setPartNum("");
      setBinwithpart([]);
      setPartSpecification({})
      return response.json
    } catch (err) {
      err.json().then((res) => {
        dispatch(setOnError({ value: true, message: res.ErrorMessage }));
      }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
    }
  }

  const saveIssueQuantity = async (payload) => {
    const epicor_endpoint = `/Erp.BO.IssueReturnSvc/OnChangeTranQty`;

    const postPayload = {
      epicor_endpoint,
      request_type: "POST",
      data: JSON.stringify(payload),
    };
    try {
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      });
      const { json } = response;
      const newjson = await perFromMeaterialMovement(json.data.parameters)
      return json.data.parameters
    } catch (err) {
      console.error(`Error fetching Reasons:`, err);
      throw err; // Rethrow the error to handle it at the call site if needed
    }
  };

  function setAdjustStateQuantity(qty) {
    if (qty) {
      const id = selectedBin.SysRowId
      setSelectedBin((prev) => ({ ...prev, QuantityOnHand: prev.QuantityOnHand + qty }))
      setBinwithpart((prev) => prev.map((data) => {
        if (data.SysRowId === id) {
          return {
            ...data,
            QuantityOnHand: data.QuantityOnHand + qty
          }
        }
        return data
      }))
    }
  }

  const handleAdjust = async () => {
    if (parseFloat(formData?.QuantityOnHand) < parseFloat(formData?.QuantityAdjust)) {
      return dispatch(setOnError({ value: true, message: 'Entered Qty is more than OnHand Qty' }))
    }
    setConfirmAdjust(false)
    if (formData?.QuantityAdjust && partNum && partNum.length > 0) {
      if (typeof formData?.QuantityAdjust === 'string' && formData?.QuantityAdjust.length === 0) {
        return dispatch(showSnackbar("Invalid Quantity"));
      } else if (typeof formData?.QuantityAdjust === 'number' && typeof formData?.QuantityOnHand === 0) {
        return dispatch(showSnackbar("Invalid Quantity"));
      }
      try {
        dispatch(
          setIsLoading({
            value: true,
            message: 'Making Adjustments. Please wait',
          })
        );
        let postData = Object.assign({}, formData);
        delete postData.SysRowID;
        let newPartjson = getNewPartNum;
        let newIssue = newPartjson.ds.IssueReturn.filter(
          (data) => data.FromWarehouseCode == formData.WareHouseCode
        );
        let arrData = Object.assign({}, newIssue[0]);
        arrData.ReasonCode = formData.reasonCode;
        arrData.ReasonType = formData.reasonType;
        arrData.PartNum = formData.PartNum;
        arrData.FromBinNum = formData.BinNum;
        arrData.Company = formData.Company;
        arrData.FromBinNum = formData.BinNum;
        arrData.UM = formData.UnitOfMeasure;
        arrData.DimCode = formData.DimCode;
        arrData.OnHandQty = formData.QuantityOnHand;
        arrData.OnHandUM = formData.UnitOfMeasure;
        arrData.TranQty = formData.QuantityAdjust;
        arrData.FromJobPlant = "MfgSys",
        arrData.ToJobPlant = "MfgSys",
        arrData.RowMod = "U",
        arrData.TreeDisplay = formData.PartNum,
        arrData.TranType = "STK-UKN",
        arrData.RequirementUOM = formData.UnitOfMeasure;
        arrData.PartIUM = formData.UnitOfMeasure;
        arrData.RequirementUOM = formData.UnitOfMeasure,
        arrData.FromWarehouseCode = formData.WareHouseCode || formData.WarehouseCode;
        arrData.TranDate = new Date(date)?.toLocaleDateString(),
        arrData.ReasonCodeDescription = formData.reasonValue;
        arrData.SysRowID = formData.SysRowID;
        let payload = {
          pdTranQty: formData.QuantityAdjust,
          ds: {
            ...newPartjson.ds,
            IssueReturn: [arrData],
          },
        };
        const transQty = await saveIssueQuantity(payload);
        const { json } = transQty;
        // setAdjustStateQuantity(parseInt(formData?.QuantityAdjust))
      } catch (err) {
        err.json().then((res) => {
          dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          // console.log({ res });
        }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
      }
    } else {
      dispatch(showSnackbar("Enter the Qty first"));
      return;
    }
  };



  useEffect(() => {
    setReasons(() => globalReasons.filter((da) => da?.ReasonType == "M"));
  }, [globalReasons]);

  useEffect(() => {
    if (globalReasons && globalReasons.length > 0) {
      setReasons(() => globalReasons.filter((da) => da?.ReasonType == "M"));
    } else {
      dispatch(fetchGlobalReasons());
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {scannerVisible ? (
        <View style={{ flex: 1 }}>
          <BarcodeScannerComponent
            closeScanner={closeScanner}
            captureDetails={captureDetails}
          // cameraState={cameraState}
          />
        </View>) :
        <View style={{ height: windowHeight - 20 }}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back-outline"
                size={24}
                color={globalStyles.colors.darkGrey}
              />
            </Pressable>
            <Text style={styles.heading}>Issue Miscellaneous Material</Text>
          </View>
          <ScrollView style={styles.body}>
            <Transferbackdrop
              loading={isLoading && !onSuccess}
              setLoading={(value) => dispatch(setIsLoading({ value, message: "" }))}
            />
            <SuccessBackdrop
              visible={onSuccess}
              onDismiss={() => {
                setTimeout(() => {
                  dispatch(setOnSuccess({ value: false, message: "" }));
                  dispatch(setIsLoading({ value: false, message: "" }));
                }, 500);
              }}
            />
            <ErrorBackdrop
              visible={onError}
              onDismiss={() => {
                setTimeout(() => {
                  dispatch(setOnError({ value: false, message: "" }));
                  dispatch(setIsLoading({ value: false, message: "" }));
                }, 500);
              }}
            />
            <Text
              style={{ fontSize: 18, paddingHorizontal: 13, fontWeight: "600" }}
            >
              From
            </Text>
            <View style={globalStyles.dFlexR}>
              <View style={{ marginHorizontal: 13, flex: 1 }}>
                <Text style={{ color: globalStyles?.colors.darkGrey }}>Part Num</Text>
                <AsyncPartSelect
                  style={[styles.input]}
                  value={partNum}
                  onChange={(val) => {
                    setPartNum(val);
                    fetchPartDetails(val)
                  }}
                  fetchOptions={getPartNums}
                />
              </View>
              {loading && <ActivityIndicator animating={true} color={MD2Colors.red800} />}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  openScanner();
                }}
              >
                <Text style={[styles.closeButtonText, { marginTop: 12 }]}>
                  <AntDesign
                    name="scan1"
                    size={24}
                    color={globalStyles.colors.darkGrey}
                  />
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.datepicker,
                globalStyles.dFlexR,
                globalStyles.justifySB,
              ]}
              onPress={() => setShowPicker(true)}
            >
              <Text>{date ? date?.toLocaleDateString() : "Select Date"}</Text>
            </TouchableOpacity>
            {showPicker && (
              <RNDateTimePicker value={date} onChange={onChangeDate} mode="date" />
            )}

            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <SelectInput
                containerStyle={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "#ccc",
                  borderRadius: 5,
                }}
                value={formData.WareHouseCode || null}
                onChange={(itemValue) => {
                  handleSelectWarehouse(itemValue);
                }}
                options={partDetails?.data?.returnObj?.PartOnHandWhse?.map(
                  (data) => ({
                    ...data,
                    label: data.WarehouseCode,
                    value: data.WarehouseCode,
                  })
                )}
                placeholder="Warehouse"
                isLoading={loading}
                label="WarehouseCode"
              // handleRefresh={handleOptionsRefresh}
              />
            </View>
            {partSpecification?.PartDescription ? (
              <Text
                style={{
                  paddingHorizontal: 13,
                  marginTop: 10,
                  color: globalStyles?.colors.darkGrey,
                }}
              >
                Description: {partSpecification?.PartDescription}
              </Text>
            ) : null}
            <View
              style={{
                margin: 12,
                borderColor: globalStyles.colors.success,
                borderWidth: 1,
              }}
            >
              {binwithPart?.length > 0 && (
                <>
                  <Text
                    style={{
                      paddingVertical: 5,
                      color: "black",
                      textAlign: "center",
                    }}
                  >
                    Please select the Bin
                  </Text>
                  <View
                    style={[
                      globalStyles.dFlexR,
                      globalStyles.justifySB,
                      styles.poModalHeader,
                    ]}
                  >
                    <Text style={{ color: "white" }}>BinNum</Text>
                    <Text style={{ color: "white" }}>OnHand Qty</Text>
                    <Text style={{ color: "white" }}>Bin Description</Text>
                  </View>
                </>
              )}
              <ScrollView style={{ maxHeight: 200, padding: 5 }}>
                {binwithPart?.length > 0 ? (
                  binwithPart?.map((bin, id) => (
                    <View
                      key={id}
                      style={{
                        padding: 2,
                        backgroundColor:
                          bin.BinNum == selectedBin?.BinNum ? "#d9d9d9" : "white",
                      }}
                    >
                      <TouchableOpacity onPress={() => onSelectBin(bin)}>
                        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                          <Text>{bin.BinNum}</Text>
                          <Text>
                            {bin.QuantityOnHand} {selectedBin?.UnitOfMeasure}
                          </Text>
                          <Text>{bin?.BinDescription}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: "center", marginVertical: 10 }}>
                    No Data Found
                  </Text>
                )}
              </ScrollView>
            </View>
            <Divider bold />
            <View style={{ marginTop: 10 }}>
              <View>
                <Text
                  style={{
                    paddingHorizontal: 13,
                    color: globalStyles?.colors.darkGrey,
                  }}
                >
                  Selected Bin
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginVertical: 5 }]}
                  // onChangeText={(val) => setPartNum(val)}
                  value={selectedBin?.BinNum}
                  editable={false}
                  placeholder="Bin"
                />
              </View>
              <View>
                <Text
                  style={{
                    paddingHorizontal: 13,
                    color: globalStyles?.colors.darkGrey,
                  }}
                >
                  Quantity ({selectedBin?.UnitOfMeasure})
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginVertical: 5 }]}
                  onChangeText={(val) => handleChange(val, "QuantityAdjust")}
                  value={formData?.QuantityAdjust?.toString()}
                  keyboardType="numeric"
                  placeholder="Quantity"
                />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: globalStyles?.colors.darkGrey }}>Reason</Text>
                <SelectInputValue
                  value={formData?.reasonValue || null}
                  onChange={(itemValue) => {
                    handleSelectReason(itemValue);
                  }}
                  options={reasons?.map((data) => ({
                    ...data,
                    label: data.Description,
                    value: data.Description,
                  }))}
                  placeholder="Reason"
                  isLoading={loading}
                  label="Reason"
                // handleRefresh={handleOptionsRefresh}
                />
              </View>
            </View>
            <PopUpDialog
              visible={confirmAdjust}
              setVisible={setConfirmAdjust}
              handleCancel={() => setConfirmAdjust(false)}
              handleOk={handleAdjust}
              title="Issue Stock Quantity"
              message={'Are you sure you want to change the stock quantity?'}
            />
          </ScrollView>
          <TouchableOpacity
            // disabled={_.isEmpty(form) || _.isEmpty(POData)}
            style={styles.receiveButton}
            onPress={() => setConfirmAdjust(true)}
          >
            <Text style={styles.receiveButtonText}>Issue</Text>
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    padding: 15,
    display: "flex",
    flexDirection: "row",
    // justifyContent: 'space-between',
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  body: {
    padding: 10,
    height: "80%",
  },
  input: {
    height: 32,
    margin: 12,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: globalStyles.colors.grey,
    borderWidth: 1,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  datepicker: {
    padding: 5,
    marginHorizontal: 12,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: globalStyles.colors.grey,
  },
  poModalHeader: {
    padding: 5,
    backgroundColor: globalStyles.colors.success,
  },
  receiveButton: {
    backgroundColor: globalStyles.colors.success,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    position: "absolute",
    bottom: 20,
    marginTop: 20,
    width: "94%",
    zIndex: 10,
  },
  receiveButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default MiscellaneousMaterial;
