import { AnalogyxBIClient } from "@analogyxbi/connection";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../Snackbar/messageSlice";
import BarcodeScannerComponent from "../../components/BarcodeScannerComponent";
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from "../../components/Loaders/toastReducers";
import PopUpDialog from "../../components/PopUpDialog";
import { globalStyles } from "../../style/globalStyles";
import {
  createDsPayload,
  fetchCountPartDetails,
  fetchXrefPart,
  getCycleScheduleDesc,
  updatePartToDataset,
} from "../Utils/InventoryUtils";
import {
  removeTag,
  setCurrentCycle,
  setSelectedCycleDetails,
} from "../reducer/inventory";
import TagsPopUp from "./components/TagsPopUp";
import SelectInputValue from "../../components/SelectInputValue";
import { isEmpty } from "../../utils/utils";

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
  tagsData,
  generateNewTags,
  fetchAllTags,
  generateNewCCDtls,
}) => {
  const navigation = useNavigation();

  const [cameraState, setCameraState] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [genNewTag, setGenNewTag] = useState(false);
  const { selectedCycleDetails, cycleTags } = useSelector(
    (state) => state.inventory
  );
  const [addPart, setAddPart] = useState(false);
  const [selectedTag, setSelectedTag] = useState({});
  const [existingPartsOnTag, setExistingPartsOnTag] = useState(
    cycleTags.filter((data) => data.TagReturned == false).map((data) => data.PartNum)
  );
  const [tagIndex, setTagIndex] = useState(0)
  const [CCPartsOnTag, setCCPartsOnTag] = useState(
    selectedCycleDetails[0].CCDtls.filter((data) => data.PartNum != "").map(
      (data) => data.PartNum
    )
  );
  const [selectedPart, setSelectedPart] = useState({});
  const [nextConfirm, setNextConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  function pickUniquePart(existingParts, newParts) {
    // Convert existingParts to a Set for efficient lookups
    const existingSet = new Set(existingParts);

    // Filter newParts to get parts that are not in existingParts
    const uniqueParts = newParts.filter((part) => !existingSet.has(part));

    // Check if there are any unique parts available
    if (uniqueParts.length === 0) {
      return null; // No unique parts available
    }

    // Pick a random item from uniqueParts
    const randomIndex = Math.floor(Math.random() * uniqueParts.length);
    return uniqueParts[randomIndex];
  }

  function getUnusedPart() {
    return pickUniquePart(existingPartsOnTag, CCPartsOnTag);
  }

  const closeScanner = () => {
    setCameraState(null);
    setScannerVisible(false);
  };

  function captureDetails(details, state) {
    if (cameraState != "bin" && cameraState != "part") {
      setCameraState(null);
      closeScanner();
      return dispatch(
        showSnackbar("Part or Bin not found for the part number")
      );
    }
    if (cameraState === "part") {
      if (details.includes("\\")) {
        let data = details.split(" \\ ");
        setPart(data[2]);
      } else {
        setPart(details);
      }
    } else if (cameraState === "bin") {
      if (details.includes("\\")) {
        let data = details.split(" \\ ");
        setBin(data[1]);
      } else {
        setBin(details);
      }
    }
    setCameraState(null);
    closeScanner();
  }

  async function setCycleDetailsToCount(finish) {
    if (finish) {
      return dispatch(showSnackbar("No more tags with part available."));
    }
  
    setLoading(true);
  
    // Find the current tag
    const currentTagNum = selectedTag?.TagNum;
    const currentIndex = tagsData.findIndex(tag => tag.TagNum === currentTagNum);
    let nextTagIndex = currentIndex + 1;
  
    // Check if currentTagNum exists and if nextTagIndex is within bounds
    if (currentIndex === -1 || (nextTagIndex >= tagsData.length && currentIndex !== tagsData.length - 1)) {
      // If no tag is selected or we're at the end of the list, use the first tag
      nextTagIndex = 0;
    }
  
    // Get the tag based on the computed index
    const tag = tagsData[nextTagIndex];
    if (tag) {
      const qty = tag.FrozenQOH ? `${parseFloat(tag.FrozenQOH).toFixed(3)}` : tag.FrozenQOH
      setBin(tag?.BinNum);
      setPart(tag?.PartNum);
      setCountedQty(qty);
      setNotes(tag?.TagNote);
      setSelectedTag({ ...tag, label: tag.TagNum, value: tag.TagNum });
    } else {
      await fetchAllTags(false, true);
      dispatch(showSnackbar('No tags found, Please refresh to get new tags'));
      setTimeout(() => {
        setCycleDetailsToCount(true);
      }, 2000);
    }
  
    setNextConfirm(false);
    setLoading(false);
  }

  async function setBlankFalse(values, tag) {
    const epicor_endpoint = `/Erp.BO.CountTagSvc/CountTags`;
    try {
      const response = await AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload: {
          epicor_endpoint,
          request_type: "POST",
          data: JSON.stringify(values),
        },
        stringify: false,
      });
      // delete data.odata
      const { json } = response;
      dispatch(
        setOnSuccess({
          value: true,
          message: `Data added on Tag ${tag}`,
        })
      );
    } catch (err) {
      try {
        const errorResponse = await err.json();
        dispatch(
          setOnError({ value: true, message: errorResponse?.ErrorMessage })
        );
        
      } catch (error) {
        dispatch(setOnError({ value: true, message: "An Error Occurred" }));
      }
    }
  }

  function findAndRemovePart(part) {
    const ccDtls = CCPartsOnTag.filter((p) => p != part);
    setCCPartsOnTag(() => [...ccDtls]);
    setExistingPartsOnTag((prev) => [...prev, part]);
  }

  function postTag() {
    setSubmitConfirm(false);
    if (isEmpty(selectedTag))
      return dispatch(showSnackbar("Please select the tag"));
    dispatch(
      setIsLoading({
        value: true,
        message: "Saving Count Cycle",
      })
    );
    try {
      const details = selectedCycleDetails[0].CCDtls;
      const cycleData = details.find((data) => data.PartNum == part);
      if (cycleData) {
        let tag = selectedTag;
        delete tag.label;
        delete tag.value;
        let values = {
          ...tag,
          BinNum: bin,
          PartNum: part,
          TagNote: notes,
          CountedBy: "Warehouse App",
          CountedQty: countedQty,
          TagReturned: true,
          CountedDate: new Date().toISOString(),
          RowMod: "U"
        };
        delete values.SysRevID;
        // const dataset = {
        //   ds: {
        //     CCTag:[values]
        //   }
        // }
        const epicor_endpoint = "/Erp.BO.CountTagSvc/CountTags";
        const qty = countedQty
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint,
            request_type: "POST",
            data: JSON.stringify(values),
          },
          stringify: false,
        })
          .then(async ({ json }) => {
            // delete data.odata
            // dispatch(
            //   setOnSuccess({
            //     value: true,
            //     message: `Data added on Tag ${tag.TagNum}`,
            //   })
            // );
            // let newPayload = json.data.parameters;
            // let tags = newPayload.ds.CCTag[0]
            // tags.BlankTag = false
            // tags.RowMod = "U"
            // await setBlankFalse({ds: {
            //   CCTag:[tags]
            // }}, tag.TagNum);
            // delete newPayload['odata.metadata']
            dispatch(removeTag(tag.TagNum));
            findAndRemovePart(cycleData.part);
            // const unPart = getUnusedPart()
            // setCycleDetailsToCount(unPart, 'MfgSys')
            await setBlankFalse({ ...values, BlankTag: false }, tag.TagNum);
            setCycleDetailsToCount(false);
          })
          .catch((err) => {
            err
              .json()
              .then((res) => {
                dispatch(
                  setOnError({ value: true, message: res.ErrorMessage })
                );
              })
              .catch((error) =>
                dispatch(
                  setOnError({ value: true, message: "An Error Occured" })
                )
              );
          });
      } else {
        dispatch(
          setOnError({
            value: true,
            message:
              "Part Not Found in the current Cycle, Please add the part to the current cycle first.",
          })
        );
        setAddPart(true);
      }
    } catch (err) {
      dispatch(showSnackbar("Error Occured while generating tags"));
      dispatch(
        setOnError({
          value: true,
          message: "Tags Not Found, Please create a new tag",
        })
      );
    }
  }

  useEffect(() => {
    // const unPart = getUnusedPart();
    setCycleDetailsToCount();
  }, []);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  if (scannerVisible) {
    return (
      <BarcodeScannerComponent
        closeScanner={closeScanner}
        captureDetails={captureDetails}
        cameraState={cameraState}
      />
    );
  }

  async function updateCCDtls(dataset, part, details) {
    const data = updatePartToDataset(dataset, part);
    const epicor_endpoint = "/Erp.BO.CCPartSelectUpdSvc/Update";
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: "POST",
        data: JSON.stringify(data),
      },
      stringify: false,
    })
      .then(async ({ json }) => {
        // let value = json.data.parameters;
        await revertCycle(details);
        // await updateCCDtls(value, part);
      })
      .catch((err) => {
        err
          .json()
          .then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          })
          .catch((error) =>
            dispatch(setOnError({ value: true, message: "An Error Occured" }))
          );
      });
  }

  async function postGetNewCCDtl(load, part, details) {
    const payload = createDsPayload(load, part);
    const epicor_endpoint = "/Erp.BO.CCPartSelectUpdSvc/GetNewCCDtl";
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: "POST",
        data: JSON.stringify(payload),
      },
      stringify: false,
    })
      .then(async ({ json }) => {
        let value = json.data.parameters;
        await updateCCDtls(value, part, details);
      })
      .catch((err) => {
        err
          .json()
          .then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          })
          .catch((error) =>
            dispatch(setOnError({ value: true, message: "An Error Occured" }))
          );
      });
  }

  async function addNewPart() {
    setAddPart(false);
    dispatch(
      setIsLoading({
        value: true,
        message: "Adding new Part.",
      })
    );
    try {
      let details = { ...currentCycle, RowMod: "U", CycleStatus: 0 };
      if (details) {
        const epicor_endpoint = "/Erp.BO.CCCountCycleSvc/CCCountCycles";
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint,
            request_type: "POST",
            data: JSON.stringify(details),
          },
          stringify: false,
        })
          .then(async ({ json }) => {
            let value = json.data;
            delete value["odata.metadata"];
            details = value;
            dispatch(setCurrentCycle(details));
            await postGetNewCCDtl(value, part, details);
          })
          .catch((err) => {
            err
              .json()
              .then((res) => {
                dispatch(
                  setOnError({ value: true, message: res.ErrorMessage })
                );
              })
              .catch((error) =>
                dispatch(
                  setOnError({ value: true, message: "An Error Occured" })
                )
              );
          });
      } else {
        dispatch(
          setOnError({
            value: true,
            message:
              "Part Not Found in the current Cycle, Please add the part to the current cycle first.",
          })
        );
        setAddPart(true);
      }
    } catch (err) {
      dispatch(showSnackbar("Error Occured while generating tags"));
      dispatch(
        setOnError({
          value: true,
          message: "Tags Not Found, Please create a new tag",
        })
      );
    }
  }

  async function revertCycle(details) {
    const values = { ...details, CycleStatus: 3 };
    const filters = `(WarehouseCode eq '${details.WarehouseCode}' and CycleSeq eq ${details.CycleSeq} and CCYear eq ${details.CCYear} and CCMonth eq ${details.CCMonth})`;
    const epicor_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles?$filter=${encodeURI(
      filters
    )}`;
    const post_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles?$expand=CCDtls`;
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: "GET",
        data: JSON.stringify(values),
      },
      stringify: false,
    })
      .then(async ({ json }) => {
        let data = json.data.value[0];
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint: post_endpoint,
            request_type: "POST",
            data: JSON.stringify({ ...data, RowMod: "U", CycleStatus: 3 }),
          },
          stringify: false,
        })
          .then(({ json }) => {
            let value = json.data;
            dispatch(setCurrentCycle(value));
            dispatch(setSelectedCycleDetails([value]));
            dispatch(
              setOnSuccess({
                value: true,
                message: "Part Added Successfully.",
              })
            );
          })
          .catch((err) => {
            err
              .json()
              .then((res) => {
                dispatch(
                  setOnError({ value: true, message: res.ErrorMessage })
                );
              })
              .catch((error) =>
                dispatch(
                  setOnError({ value: true, message: "An Error Occured" })
                )
              );
          });
      })
      .catch((err) => {
        err
          .json()
          .then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          })
          .catch((error) =>
            dispatch(setOnError({ value: true, message: "An Error Occured" }))
          );
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setScreen("initial")}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Counting Process</Text>
        <View style={styles.menu}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Entypo
                name="dots-three-vertical"
                onPress={openMenu}
                size={18}
                color="black"
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setVisible(false);
                setGenNewTag(true);
              }}
              title="Generate New Tags"
            />
            {/* Additional Menu Items can be added here */}
          </Menu>
        </View>
      </View>

      <View style={[globalStyles.dFlexR, styles.detailsContainer]}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle No</Text>
            <Text style={styles.value}>{currentCycle.CycleSeq} </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>WH</Text>
            <Text style={styles.value}>
              {currentCycle.CCHdrWarehseDescription}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cycle Date</Text>
            <Text style={styles.value}>
              {new Date(currentCycle.CycleDate).toISOString().split("T")[0]}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{getCycleScheduleDesc(currentCycle.CycleStatus)}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.countingScreen}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, width: 300 }}>
          <Text style={{paddingHorizontal: 8}}>Tag Num</Text>
            <SelectInputValue
              value={selectedTag.TagNum}
              onChange={(tag) => {
                const qty = tag.FrozenQOH ? `${parseFloat(tag.FrozenQOH).toFixed(3)}` : tag.FrozenQOH
                setBin(tag?.BinNum);
                setPart(tag?.PartNum);
                setCountedQty(qty);
                setNotes(tag?.TagNote);
                setSelectedTag({ ...tag, label: tag.TagNum, value: tag.TagNum });
              }}
              options={tagsData.map((data) => ({
                ...data,
                label: data.TagNum,
                value: data.TagNum,
              }))}
              isLoading={false}
              label="TagNum"
              handleRefresh={() => {}}
              placeholder={"Select Tag Number"}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{paddingHorizontal: 8}}>Part Number </Text>
            <TextInput
              style={styles.input}
              placeholder="Part (Scanning / Enter)"
              value={part}
              onChangeText={setPart}
            />
         
            {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                setCameraState("part");
                setScannerVisible(true);
              }}
            >
              <Ionicons name="scan-outline" size={24} color="#333" />
            </TouchableOpacity> */}
          </View>
          <View style={styles.inputContainer}>
            <Text style={{paddingHorizontal: 8}}>Description </Text>
            <TextInput
              style={{...styles.input, color:'black'}}
              placeholder="Part Description"
              value={selectedTag?.PartNumPartDescription}
              onChangeText={(text)=>{
                setSelectedTag((prev)=>({...prev, PartNumPartDescription: text}))
              }}
                multiline={true}
                numberOfLines={5}
                textAlignVertical="center"
                editable={false}
              
            />
            {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                setCameraState("part");
                setScannerVisible(true);
              }}
            >
              <Ionicons name="scan-outline" size={24} color="#333" />
            </TouchableOpacity> */}
          </View>
          <View style={styles.inputContainer}>
          <Text style={{paddingHorizontal: 8}}>Bin Num</Text>
            <TextInput
              style={styles.input}
              placeholder="Bin (Scanning / Enter)"
              value={bin}
              onChangeText={setBin}
            />
            {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                setCameraState("bin");
                setScannerVisible(true);
              }}
            >
              <Ionicons name="scan-outline" size={24} color="#333" />
            </TouchableOpacity> */}
          </View>
          <View style={styles.inputContainer}>
            <Text style={{paddingHorizontal: 8}}>Counted QTY</Text>
            <TextInput
              style={styles.input}
              placeholder="Counted Qty (Manual Input)"
              value={countedQty}
              onChangeText={setCountedQty}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{paddingHorizontal: 8}}>UOM</Text>
            <TextInput
              style={styles.input}
              placeholder="UOM"
              value={selectedTag?.UOM}
              onChangeText={(text) => {
                setSelectedTag((prev) => ({ ...prev, UOM: text }));
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{paddingHorizontal: 8}}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Notes (Manual Input - If any)"
              value={notes}
              onChangeText={setNotes}
            />
            </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setSubmitConfirm(true)}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setNextConfirm(true)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>

      <PopUpDialog
        visible={submitConfirm}
        setVisible={setSubmitConfirm}
        handleCancel={() => setSubmitConfirm(false)}
        handleOk={postTag}
        title="Save Changes"
        message={"Are you sure you want Save details on tag to proceed to next tag?"}
      />
      <PopUpDialog
        visible={nextConfirm}
        setVisible={setNextConfirm}
        handleCancel={() => setNextConfirm(false)}
        handleOk={() => {
          setCycleDetailsToCount(false);
          // if (unPart) {
          // } else {
          //   dispatch(showSnackbar("No More parts available for the cycle."));
          // }
        }}
        title="Move to next Part"
        message={"Are you sure to change the tag?"}
        loading={loading}
      />
      <TagsPopUp
        visible={genNewTag}
        setVisible={setGenNewTag}
        handleCancel={() => setGenNewTag(false)}
        handleOk={(value) => {
          setGenNewTag(false);
          generateNewTags(value);
        }}
        title="Generate New"
        message={"Please enter the number of tags to be generated"}
      />
      <PopUpDialog
        visible={addPart}
        setVisible={setAddPart}
        handleCancel={() => setAddPart(false)}
        handleOk={addNewPart}
        title="Add New Part"
        message={"Do you wish to add new part to the cycle?"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 150, // Adjust height as needed
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlignVertical: 'top', // Align text to the top of the TextInput
    backgroundColor: '#f5f5f5', // Optional: to give a distinct background
},
  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#fff", // Ensure header is visible with a background color
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  menu: {
    position: "absolute",
    right: 18,
  },
  detailsContainer: {
    flexWrap: "wrap",
    marginHorizontal: 50,
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  countingScreenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  countingScreen: {
    padding: 20,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: 300,
    height: 40,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  inputNoIcon: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  icon: {
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  footerButton: {
    width: 300,
    height: 50,
    backgroundColor: globalStyles.colors.success,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CountingScreen;
