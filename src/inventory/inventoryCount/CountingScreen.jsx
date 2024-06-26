import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  BackHandler,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../../style/globalStyles';
import { useNavigation } from '@react-navigation/native';
import BarcodeScannerComponent from '../../components/BarcodeScannerComponent';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../Snackbar/messageSlice';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from '../../components/Loaders/toastReducers';
import PopUpDialog from '../../components/PopUpDialog';
import {
  removeTag,
  setCurrentCycle,
  setSelectedCycleDetails,
} from '../reducer/inventory';
import { Button, Menu, Divider } from 'react-native-paper';
import Entypo from '@expo/vector-icons/Entypo';
import TagsPopUp from './components/TagsPopUp';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import { createDsPayload, updatePartToDataset } from '../Utils/InventoryUtils';
import getClientErrorMessage from '../../utils/getClientErrorMessage';

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
  generateNewCCDtls,
}) => {
  const navigation = useNavigation();

  const [cameraState, setCameraState] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [visible, setVisible] = React.useState(false);
  const [genNewTag, setGenNewTag] = useState(false);
  const { selectedCycleDetails } = useSelector((state) => state.inventory);
  const [addPart, setAddPart] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

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
    } else if (details.includes('\\')) {
      let data = details.split(' \\ ');
      setBin(data[1]);
    }
    // setFormData((prev) => ({ ...prev, [state]: details }));
    setCameraState(null);
    closeScanner();
  }

  function postTag() {
    setSubmitConfirm(false);
    dispatch(
      setIsLoading({
        value: true,
        message: 'Saving Count Cycle',
      })
    );
    try {
      const details = selectedCycleDetails[0].CCDtls;
      const cycleData = details.find((data) => data.PartNum == part);
      if (cycleData) {
        const tag = tagsData[0];
        let values = {
          ...tag,
          BinNum: bin,
          PartNum: part,
          TagNote: notes,
          CountedBy: 'App User',
          CountedQty: countedQty,
          UOM: cycleData.BaseUOM,
          TagReturned: true,
          BlankTag: false,
        };

        const epicor_endpoint = '/Erp.BO.CountTagSvc/CountTags';
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint,
            request_type: 'POST',
            data: JSON.stringify(values),
          },
          stringify: false,
        })
          .then(({ json }) => {
            // delete data.odata
            dispatch(
              setOnSuccess({
                value: true,
                message: `Data added on Tag ${tag.TagNum}`,
              })
            );
            dispatch(removeTag(tag.TagNum));
            setPart('');
            setBin('');
            setNotes('');
            setCountedQty('0');
          })
          .catch((err) => {
            getClientErrorMessage(err).then(({ message }) => {
              dispatch(
                setOnError({
                  value: true,
                  message: message,
                })
              );
            });
          });
      } else {
        dispatch(
          setOnError({
            value: true,
            message:
              'Part Not Found in the current Cycle, Please add the part to the current cycle first.',
          })
        );
        setAddPart(true);
      }
    } catch (err) {
      dispatch(showSnackbar('Error Occured while generating tags'));
      dispatch(
        setOnError({
          value: true,
          message: 'Tags Not Found, Please create a new tag',
        })
      );
    }
  }

  // dispatch(setOnError({ message: '', value: true }));

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
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
    const epicor_endpoint = '/Erp.BO.CCPartSelectUpdSvc/Update';
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
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
        // err.json().then(({ error }) => {
        //   // dispatch(setOnError({ value: true, message: res.error }));
        //   dispatch(
        //     setOnError({
        //       value: true,
        //       message: error.ErrorMessage,
        //     })
        //   );
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
  }

  async function postGetNewCCDtl(load, part, details) {
    const payload = createDsPayload(load, part);
    const epicor_endpoint = '/Erp.BO.CCPartSelectUpdSvc/GetNewCCDtl';
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint,
        request_type: 'POST',
        data: JSON.stringify(payload),
      },
      stringify: false,
    })
      .then(async ({ json }) => {
        let value = json.data.parameters;
        await updateCCDtls(value, part, details);
      })
      .catch((err) => {
        // err.json().then(({ error }) => {
        //   // dispatch(setOnError({ value: true, message: res.error }));
        //   dispatch(
        //     setOnError({
        //       value: true,
        //       message: error.ErrorMessage,
        //     })
        //   );
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
  }

  async function addNewPart() {
    setAddPart(false);
    dispatch(
      setIsLoading({
        value: true,
        message: 'Adding new Part.',
      })
    );
    try {
      let details = { ...currentCycle, RowMod: 'U', CycleStatus: 0 };
      if (details) {
        const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/CCCountCycles';
        AnalogyxBIClient.post({
          endpoint: `/erp_woodland/resolve_api`,
          postPayload: {
            epicor_endpoint,
            request_type: 'POST',
            data: JSON.stringify(details),
          },
          stringify: false,
        })
          .then(async ({ json }) => {
            let value = json.data;
            delete value['odata.metadata'];
            details = value;
            dispatch(setCurrentCycle(details));
            await postGetNewCCDtl(value, part, details);
          })
          .catch((err) => {
            // err.json().then(({ error }) => {
            //   // dispatch(setOnError({ value: true, message: res.error }));
            //   dispatch(
            //     setOnError({
            //       value: true,
            //       message: error.ErrorMessage,
            //     })
            //   );
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
      } else {
        dispatch(
          setOnError({
            value: true,
            message:
              'Part Not Found in the current Cycle, Please add the part to the current cycle first.',
          })
        );
        setAddPart(true);
      }
    } catch (err) {
      dispatch(showSnackbar('Error Occured while generating tags'));
      dispatch(
        setOnError({
          value: true,
          message: 'Tags Not Found, Please create a new tag',
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
        request_type: 'GET',
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
            request_type: 'POST',
            data: JSON.stringify({ ...data, RowMod: 'U', CycleStatus: 3 }),
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
                message: 'Part Added Successfully.',
              })
            );
          })
          .catch((err) => {
            // dispatch(
            //   setOnError({
            //     value: true,
            //     message: 'error',
            //   })
            // );
            // err.json().then(({ error }) => {
            //   // dispatch(setOnError({ value: true, message: res.error }));
            //   dispatch(
            //     setOnError({
            //       value: true,
            //       message: error.ErrorMessage,
            //     })
            //   );
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
      })
      .catch((err) => {
        // err.json().then(({ error }) => {
        //   // dispatch(setOnError({ value: true, message: res.error }));
        //   dispatch(
        //     setOnError({
        //       value: true,
        //       message: error.ErrorMessage,
        //     })
        //   );
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
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
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
            {/* <Menu.Item onPress={() => {}} title="Item 2" />
            <Divider />
            <Menu.Item onPress={() => {}} title="Item 3" /> */}
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
            onPress={() => setSubmitConfirm(true)}
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
      <PopUpDialog
        visible={submitConfirm}
        setVisible={setSubmitConfirm}
        handleCancel={() => setSubmitConfirm(false)}
        handleOk={postTag}
        title="Save Changes"
        message={'Are you sure you want Save details on tag?'}
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
        message={'Please enter the number of tags to be generated'}
      />
      <PopUpDialog
        visible={addPart}
        setVisible={setAddPart}
        handleCancel={() => setAddPart(false)}
        handleOk={addNewPart}
        title="Add New Part"
        message={'Do you wish to add new part to the cycle?'}
      />
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
    position: 'relative',
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
  menu: {
    position: 'absolute',
    right: 18,
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
