import { AnalogyxBIClient } from '@analogyxbi/connection';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBackdrop from '../../components/Loaders/ErrorBackdrop';
import SuccessBackdrop from '../../components/Loaders/SuccessBackdrop';
import {
  setIsLoading,
  setOnError,
  setOnSuccess,
} from '../../components/Loaders/toastReducers';
import Transferbackdrop from '../../components/Loaders/Transferbackdrop';
import { showSnackbar } from '../../Snackbar/messageSlice';
import {
  setCurrentCycle,
  setCycleTags,
  setScreenLayout,
  setSelectedCycleDetails,
  setTagsData,
} from '../reducer/inventory';
import CountingScreen from './CountingScreen';
import InitialScreen from './InitialScreen';
import { isEmpty } from '../../utils/utils';

export default function CycleApp() {
  // const [screen, setScreen] = useState('initial'); // Initial screen state
  const { currentCycle, tagsData, selectedCycleDetails, screen } = useSelector(
    (state) => state.inventory
  );
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [part, setPart] = useState('');
  const [bin, setBin] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [notes, setNotes] = useState('');
  const dispatch = useDispatch();
  
  async function fetchAllTags(isCount = true, showLoading = false) {
    if (showLoading) {
      dispatch(
        setIsLoading({
          value: true,
          message: 'Fetching Tags, Please Wait',
        })
      );
    }
    const filters = encodeURI(
      `(WarehouseCode eq '${currentCycle.WarehouseCode}' and CycleSeq eq ${currentCycle.CycleSeq} and CCYear eq ${currentCycle.CCYear} and CCMonth eq ${currentCycle.CCMonth}) and TagReturned eq false`
    );
    let endpoint = `/Erp.BO.CountTagSvc/CountTags?top=300&$filter=${filters}&$skip=0`;
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/resolve_api`,
      postPayload: {
        epicor_endpoint: endpoint,
        request_type: 'GET',
      },
      stringify: false,
    })
      .then(({ json }) => {
        // console.log({json})
        // console.log("TAGS FETCHEDDDDDDDDDDDD")
        // console.log("TAGS FETCHEDDDDDDDDDDDD")
        // console.log({json})
        // console.log("TAGS FETCHEDDDDDDDDDDDD")
        // console.log("TAGS FETCHEDDDDDDDDDDDD")
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
        dispatch(setTagsData(json.data.value));
        dispatch(setCycleTags(json.data.value));
        // if (isCount || showLoading) {
        // }
      })
      .catch((err) => {
        err.json().then((res) => {
          dispatch(setOnError({ value: true, message: res.ErrorMessage }));
        }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
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
      let CCDtls = selectedCycleDetails[0].CCDtls 
      const tags = !startCount
        ? parseInt(currentCycle.TotalParts)
        : parseInt(CCDtls.length);
      // const dtl = CCDtls.map((data)=> ({...data,  "PostAdjustment": 2, "PartNumSellingFactor": 1,"PartNumPricePerCode": "E"}))
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
              BlankTagsOnly: false,
              NumOfBlankTags: tags,
              TotalParts: tags,
              RowMod: 'U',
            },
          ],
          CCDtl: CCDtls
        },
      };

      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")
      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")
      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")
      // console.log({values})
      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")
      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")
      // console.log("VALUES POSTING TO GEN TAGSSSSSSSS")

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
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          // console.log({json})
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          // console.log("TAGS GEN JSONNNNNNNNNNNNNNNNNN")
          if (startCount) {
            startCountProcess(json.data.parameters);
          } else {
            fetchAllTags(true);
          }
        })
        .catch((err) => {
          err.json().then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
        });
    } catch (err) {
      console.log({err})
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
          fetchAllTags(false, true);
        })
        .catch((err) => {
          err.json().then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
          }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
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
    const details = newData.ds.CCDtl;
    let values = {
      ds: {
        CCHdr: [
          {
            ...currentCycle,
            CycleStatus: 1,
            EnablePrintTags: true,
            EnableReprintTags: true,
            EnableStartCountSeq: true,
            EnableVoidBlankTags: false,
            EnableVoidTagsByPart: false,
            BlankTagsOnly: false,
            RowMod: 'U',
          },
        ],
        CCDtl: [...details]
      },
    };

    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
    // console.log({values})
    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
    // console.log("START COUNT SEQQQQQQQQQQQQQQQQQQ")
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
        dispatch(setCurrentCycle({ ...currentCycle, CycleStatus: 2 }));
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")
    // console.log({json})
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")
    // console.log("START COUNT Responseeeeeeeeeeeeeeee")

        fetchAllTags(false);
      })
      .catch((err) => {
        err.json().then((res) => {
          dispatch(setOnError({ value: true, message: res.ErrorMessage }));
        }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
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
          err.json().then((res) => {
            dispatch(setOnError({ value: true, message: res.ErrorMessage }));
            // console.log({ res });
          }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
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
      if (currentCycle.WarehouseCode) {
        // setCyclesLoading(true);
        dispatch(setIsLoading({ value: true, message: 'Please wait...' }));
        const filterString = encodeURI(
          `(WarehouseCode eq '${currentCycle.WarehouseCode}' and CycleSeq eq ${currentCycle.CycleSeq} and CCMonth eq ${currentCycle.CCMonth} and CCYear eq ${currentCycle.CCYear} and Company eq '${currentCycle.Company}' and Plant eq '${currentCycle.Plant}')`
        );
        const epicor_endpoint = `/Erp.BO.CCCountCycleSvc/CCCountCycles?$expand=CCDtls&$filter=${filterString}`;
        try {
          AnalogyxBIClient.post({
            endpoint: `/erp_woodland/resolve_api`,
            postPayload: { epicor_endpoint, request_type: 'GET' },
            stringify: false,
          })
            .then(({ json }) => {
              dispatch(setSelectedCycleDetails(json.data.value));
              const selectedData = json.data.value[0];
              const details = selectedData?.CCDtls ? selectedData?.CCDtls : [];
              let values = {
                ds: {
                  CCHdr: [
                    {
                      ...selectedData,
                      BlankTagsOnly: false,
                      RowMod: 'U',
                    },
                  ],
                  CCDtl: details.map((data)=> ({...data, PostStatus: 1, PostAdjustment:2})),
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
                  dispatch(setIsLoading({ value: false, message: '' }));
                  dispatch(
                    setOnSuccess({
                      value: true,
                      message: 'Count Posted Successfully.',
                    })
                  );
                })
                .catch((err) => {
                  err.json().then((res) => {
                    dispatch(setOnError({ value: true, message: res.ErrorMessage }));
                    // console.log({ res });
                  }).catch((error) => dispatch(setOnError({ value: true, message: 'An Error Occured' })))
                });
            })
            .catch((err) => {
              dispatch(setIsLoading({ value: false, message: '' }));
              dispatch(
                showSnackbar('Error Occured While fetching cycle Details')
              );
            });
        } catch (err) {
          dispatch(setIsLoading({ value: false, message: '' }));
          dispatch(showSnackbar('Error Occured While fetching cycle Details'));
        }
      }

    } catch (err) {
      dispatch(showSnackbar('Error Occured while posting count'));
      dispatch(
        setOnError({
          value: true,
          message: 'Error Occured while posting count',
        })
      );
    }
  }

  useEffect(()=>{
    fetchAllTags(false, true)
  },[])


  return (
    <SafeAreaView style={styles.container}>
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
          setScreen={(data)=> dispatch(setScreenLayout(data))}
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
          setScreen={(data)=> dispatch(setScreenLayout(data))}
          currentCycle={currentCycle}
          loading={isLoading}
          tagsData={tagsData}
          generateNewTags={generateNewTags}
          generateNewCCDtls={generateNewCCDtls}
          fetchAllTags={fetchAllTags}
        />
      )}
    </SafeAreaView>
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
