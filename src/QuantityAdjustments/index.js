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
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import SelectInput from "../components/SelectInput";
import {
  fetchOnePartDetailsApi,
  fetchPartDetailsApi,
  fetchReasons,
} from "./utils";
import { showSnackbar } from "../Snackbar/messageSlice";
import SelectInputValue from "../components/SelectInputValue";
import { setIsLoading, setOnError, setOnSuccess } from "../components/Loaders/toastReducers";
import { AnalogyxBIClient } from "@analogyxbi/connection";
import { fetchGlobalReasons, setGlobalReasons } from "./materialSlice";
import Transferbackdrop from "../components/Loaders/Transferbackdrop";
import SuccessBackdrop from "../components/Loaders/SuccessBackdrop";
import ErrorBackdrop from "../components/Loaders/ErrorBackdrop";
import PopUpDialog from "../components/PopUpDialog";
import SelectAsync from "../components/SelectAsync";
import { getBinsData } from "../utils/utils";
import BarcodeScannerComponent from "../components/BarcodeScannerComponent";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const QuantityAdjustments = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [partNum, setPartNum] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [binwithPart, setBinwithpart] = useState([]);
  const [formData, setFormData] = useState({});
  const [partDetails, setPartdetails] = useState();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [partSpecification, setPartSpecification] = useState();
  const [selectedBin, setSelectedBin] = useState({});
  const [reasons, setReasons] = useState([]);
  const [confirmAdjust, setConfirmAdjust] = useState(false)
  const { globalReasons } = useSelector((state) => state.material);
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);

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

  function setAdjustStateQuantity(qty){
    if(qty){
        const id = selectedBin.SysRowId
        setSelectedBin((prev) => ({...prev , QuantityOnHand: prev.QuantityOnHand + qty}))
        setBinwithpart((prev)=> prev.map((data)=> {
            if(data.SysRowId === id){
                return {
                    ...data,
                    QuantityOnHand: data.QuantityOnHand + qty
                }
            }
            return data
        }))
    }
  }
  const onSelectBin = (val) => {
    setFormData((prev) => ({ ...prev, ...val }));
    setSelectedBin(val);
  };

  const handleChange = (val, name) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleAdjust = async () => {
    setConfirmAdjust(false)
    if (formData?.QuantityAdjust && formData?.QuantityAdjust.length > 0 && partNum) {
      if (typeof formData?.QuantityAdjust === 'string' && formData?.QuantityAdjust.length === 0) {
        return dispatch(showSnackbar("Invalid Quantity"));
      } else if (typeof formData?.QuantityAdjust === 'number' && typeof formData?.QuantityAdjust === 0) {
        return dispatch(showSnackbar("Invalid Quantity"));
      }
      dispatch(
        setIsLoading({
          value: true,
          message: 'Making Adjustments. Please wait',
        })
      );
      const postdata = {
        ds: {
          InventoryQtyAdj: [
            {
              Company: formData?.Company || partSpecification?.Company,
              PartNum: formData?.PartNum || partNum,
              WareHseCode: formData?.WareHouseCode,
              OnHandQty: binwithPart?.length == 0 ? "0" :(formData?.OnHandQty || formData?.QuantityOnHand)?.toString(),
              BinNum: binwithPart?.length == 0 ? formData?.bin : formData?.BinNum,
              AdjustQuantity: formData?.QuantityAdjust,
              ReasonCode: formData?.reasonCode,
              UnitOfMeasure: formData?.DimCode || partSpecification?.IUM,
              TransDate: new Date(date)?.toLocaleDateString(),
              ReasonType: formData?.reasonType,
              OnHandUOM: formData?.DimCode || partSpecification?.IUM,
              ReasonCodeDescription: formData?.reasonValue,
              RowMod: "U",
            },
          ],
        },
      };

      const postString = JSON.stringify(postdata);

      const epicor_endpoint = `/Erp.BO.InventoryQtyAdjSvc/SetInventoryQtyAdj`;
      const postPayload = {
        epicor_endpoint,
        request_type: "POST",
        data: postString,
      };
      try {
        const response = await AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload,
          stringify: false,
        });
        dispatch(setOnSuccess({ value: true, message: "Quantity Adjusted" }));
        setAdjustStateQuantity(parseInt(formData?.QuantityAdjust))
      } catch (err) {
        err.json().then((res) => {
          dispatch(setOnError({ value: true, message: res.ErrorMessage }));
        }).catch((error) => {
          dispatch(setOnError({ value: true, message: 'An Error Occured' }))
        }
        )
      }
    } else {
      dispatch(showSnackbar("Enter the Qty first"));
      return;
    }
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
        </View>)
        : 
        <View style={{height: windowHeight - 20}}>
          <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Quantity Adjustments</Text>
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
          Selection
        </Text>
        <View style={globalStyles.dFlexR}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            onChangeText={(val) => setPartNum(val)}
            value={partNum}
            // editable={!loading}
            placeholder="Part Num"
          />
          <Pressable onPress={()=> {
            fetchPartDetails(partNum)
          }}>
            {!loading ? (
              <Feather
                name="search"
                size={24}
                color={globalStyles.colors.darkGrey}
              />
            ) : (
              <ActivityIndicator animating={true} color={MD2Colors.red800} />
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
        <Text
          style={{ fontSize: 18, paddingHorizontal: 13, fontWeight: "600" }}
        >
          Adjustment
        </Text>
        <View style={{ marginTop: 10 }}>
          {
            binwithPart?.length == 0 &&
            <View style={{ marginHorizontal: 13 }}>
              <Text style={{ color: globalStyles?.colors.darkGrey }}>Select Bin</Text>
              <SelectAsync
                style={[styles.input, { flex: 1, marginVertical: 5 }]}
                value={formData?.bin}
                onChange={(itemValue) => {
                  console.log("itemValue", itemValue)
                  setFormData(prev => ({ ...prev, bin: itemValue }));
                }}
                fetchOptions={getBinsData}
                warehouse={formData.WareHouseCode}
              />
            </View>
          }
          <View>
            <Text
              style={{
                paddingHorizontal: 13,
                color: globalStyles?.colors.darkGrey,
              }}
            >
              Bin
            </Text>
            <TextInput
              style={[styles.input, { flex: 1, marginVertical: 5 }]}
              // onChangeText={(val) => setPartNum(val)}
              value={formData?.bin || selectedBin?.BinNum}
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
          title="Adjust Stock Quantity"
          message={'Are you sure you want to change the stock quantity?'}
        />
      </ScrollView>
      <TouchableOpacity
        // disabled={_.isEmpty(form) || _.isEmpty(POData)}
        style={styles.receiveButton}
        onPress={() => setConfirmAdjust(true)}
      >
        <Text style={styles.receiveButtonText}>Adjust</Text>
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

export default QuantityAdjustments;
