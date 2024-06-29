import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import InitialScreen from './InitialScreen';
import CountingScreen from './CountingScreen';
import { useDispatch, useSelector } from 'react-redux';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from '../../components/Loaders/toastReducers';
import ErrorBackdrop from '../../components/Loaders/ErrorBackdrop';
import SuccessBackdrop from '../../components/Loaders/SuccessBackdrop';
import Transferbackdrop from '../../components/Loaders/Transferbackdrop';
import {
  setCurrentCycle,
  setCycleTags,
  setTagsData,
} from '../reducer/inventory';
import { showSnackbar } from '../../Snackbar/messageSlice';
import getClientErrorMessage from '../../utils/getClientErrorMessage';

export default function CycleApp() {
  const [screen, setScreen] = useState('initial'); // Initial screen state
  const { currentCycle, tagsData, selectedCycleDetails } = useSelector(
    (state) => state.inventory
  );
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [part, setPart] = useState('');
  const [bin, setBin] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [notes, setNotes] = useState('');
  const dispatch = useDispatch();

  function fetchAllTags(isCount = true, showLoading = false) {
    if (showLoading) {
      dispatch(
        setIsLoading({
          value: true,
          message: 'Fetcing Tags, Please Wait',
        })
      );
    }
    const filters = encodeURI(
      `(WarehouseCode eq '${currentCycle.WarehouseCode}' and CycleSeq eq ${currentCycle.CycleSeq} and CCYear eq ${currentCycle.CCYear} and CCMonth eq ${currentCycle.CCMonth})`
    );
    let endpoint = `/Erp.BO.CountTagSvc/CountTags?$filter=${filters}&top=500`;
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint: endpoint,
        request_type: 'GET',
      },
      stringify: false,
    })
      .then(({ json }) => {
        dispatch(setTagsData(json.data.value));
        dispatch(setCycleTags(json.data.value));
        if (isCount || showLoading) {
          dispatch(
            setOnSuccess({
              value: true,
              message: showLoading
                ? 'Tags fetched successfully'
                : isCount
                ? 'Count Started Successfully.'
                : 'Cycle Started Successfully.',
            })
          );
        }
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
        // err.json().then(({ error }) => {
        //   dispatch(
        //     setOnError({
        //       value: true,
        //       message: error.ErrorMessage,
        //     })
        //   );
        // });
      });
  }

  function generateTagsAndStartCount(startCount = true, tagNum) {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Generating Tags and Starting the Cycle',
      })
    );
    try {
      const tags = !startCount
        ? parseInt(currentCycle.TotalParts) + tagNum
        : parseInt(currentCycle.TotalParts) + 30;

      let values = {
        ds: {
          CCHdr: [
            {
              ...currentCycle,
              EnablePrintTags: true,
              EnableReprintTags: true,
              EnableStartCountSeq: true,
              EnableVoidBlankTags: false,
              EnableVoidTagsByPart: false,
              BlankTagsOnly: true,
              NumOfBlankTags: tags,
              RowMod: 'U',
            },
          ],
        },
      };
      const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/GenerateTags';
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
          const newData = {
            ...currentCycle,
            CycleStatus: 1,
            EnablePrintTags: true,
            EnableReprintTags: true,
            EnableStartCountSeq: true,
            EnableVoidBlankTags: false,
            EnableVoidTagsByPart: false,
            BlankTagsOnly: true,
            NumOfBlankTags: tags,
            RowMod: 'U',
          };
          dispatch(
            setCurrentCycle({
              ...newData,
            })
          );
          if (startCount) {
            startCountProcess(newData);
            // fetchAllTags(false);
          } else {
            fetchAllTags(true);
          }
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
          // err.json().then(({ error }) => {
          //   // dispatch(setOnError({ value: true, message: res.error }));
          //   dispatch(
          //     setOnError({
          //       value: true,
          //       message: error.ErrorMessage,
          //     })
          //   );
          // });
        });
    } catch (err) {
      dispatch(showSnackbar('Error Occured while generating tags'));
      dispatch(
        setOnError({
          value: true,
          message: 'Error Occured while generating tags',
        })
      );
    }
  }

  function generateNewTags(tagNum) {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Generating Tags and Starting the Cycle',
      })
    );
    try {
      const num = tagNum ? tagNum : 10;
      const tags = parseInt(currentCycle.TotalParts) + num;
      let values = {
        ds: {
          CCHdr: [
            {
              ...currentCycle,
              BlankTagsOnly: true,
              NumOfBlankTags: tags,
              RowMod: 'U',
            },
          ],
        },
      };
      const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/GenerateTags';
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
          const newData = {
            ...currentCycle,
            NumOfBlankTags: tags,
          };
          dispatch(
            setCurrentCycle({
              ...newData,
            })
          );
          // dispatch(
          //   setOnSuccess({
          //     value: true,
          //     message: 'Tags generated Successfully.',
          //   })
          // );
          fetchAllTags(false, true);
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
          // err.json().then(({ error }) => {
          //   // dispatch(setOnError({ value: true, message: res.error }));
          //   dispatch(
          //     setOnError({
          //       value: true,
          //       message: error.ErrorMessage,
          //     })
          //   );
          // });
        });
    } catch (err) {
      dispatch(showSnackbar('Error Occured while generating new tags'));
      dispatch(
        setOnError({
          value: true,
          message: 'Error Occured while generating new tags',
        })
      );
    }
  }

  function startCountProcess(newData) {
    let values = {
      ds: {
        CCHdr: [
          {
            ...newData,
          },
        ],
      },
    };
    const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/StartCountSequence';
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
        dispatch(setCurrentCycle({ ...newData, CycleStatus: 2 }));
        fetchAllTags(false);
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
        // err.json().then(({ error }) => {
        //   dispatch(
        //     setOnError({
        //       value: true,
        //       message: error.ErrorMessage,
        //     })
        //   );
        //   // dispatch(setOnError({ value: true, message: res.error }));
        // });
      });
  }

  function generateNewCCDtls() {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Generating Tags and Starting the Cycle',
      })
    );
    try {
      const details = selectedCycleDetails[0].CCDtls;
      let values = {
        ds: {
          CCHdr: [
            {
              ...currentCycle,
              RowMod: 'U',
            },
          ],
          CCDtl: [...details],
        },
      };
      const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/GenerateTags';
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
          const newData = {
            ...currentCycle,
            CycleStatus: 1,
            EnablePrintTags: true,
            EnableReprintTags: true,
            EnableStartCountSeq: true,
            EnableVoidBlankTags: false,
            EnableVoidTagsByPart: false,
            BlankTagsOnly: true,
            NumOfBlankTags: tags,
            RowMod: 'U',
          };
          dispatch(
            setCurrentCycle({
              ...newData,
            })
          );
          if (startCount) {
            startCountProcess(newData);
            // fetchAllTags(false);
          } else {
            fetchAllTags(true);
          }
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
    } catch (err) {
      dispatch(showSnackbar('Error Occured while generating tags'));
      dispatch(
        setOnError({
          value: true,
          message: 'Error Occured while generating tags',
        })
      );
    }
  }

  function postCount() {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Posting count, Please wait',
      })
    );
    try {
      let values = {
        ds: {
          CCHdr: [
            {
              ...currentCycle,
              BlankTagsOnly: false,
              RowMod: 'U',
            },
          ],
        },
      };
      const epicor_endpoint = '/Erp.BO.CCCountCycleSvc/PostCount';
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
              message: 'Count Posted Successfully.',
            })
          );
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
    } catch (err) {
      console.log({ err });
      dispatch(showSnackbar('Error Occured while posting count'));
      dispatch(
        setOnError({
          value: true,
          message: 'Error Occured while posting count',
        })
      );
    }
  }

  useEffect(() => {
    if (currentCycle && currentCycle.CycleStatus >= 2) {
      fetchAllTags(false, true);
    }
  }, [currentCycle]);

  return (
    <View style={styles.container}>
      <Transferbackdrop
        loading={isLoading && !onSuccess}
        setLoading={(value) => dispatch(setIsLoading({ value, message: '' }))}
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
      {screen === 'initial' ? (
        <InitialScreen
          setScreen={setScreen}
          currentCycle={currentCycle}
          generateTagsAndStartCount={generateTagsAndStartCount}
          loading={isLoading}
          postCount={postCount}
        />
      ) : (
        <CountingScreen
          part={part}
          setPart={setPart}
          bin={bin}
          setBin={setBin}
          countedQty={countedQty}
          setCountedQty={setCountedQty}
          notes={notes}
          setNotes={setNotes}
          setScreen={setScreen}
          currentCycle={currentCycle}
          loading={isLoading}
          tagsData={tagsData}
          generateNewTags={generateNewTags}
          generateNewCCDtls={generateNewCCDtls}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
