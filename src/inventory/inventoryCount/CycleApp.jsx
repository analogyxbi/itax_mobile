import React, { useState } from 'react';
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
import { setCurrentCycle } from '../reducer/inventory';
import { showSnackbar } from '../../Snackbar/messageSlice';

export default function CycleApp() {
  const [screen, setScreen] = useState('initial'); // Initial screen state
  const { currentCycle } = useSelector((state) => state.inventory);
  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [part, setPart] = useState('');
  const [bin, setBin] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [notes, setNotes] = useState('');
  const dispatch = useDispatch();

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
          } else {
            dispatch(
              setOnSuccess({
                value: true,
                message: 'Tags Generated Successfully.',
              })
            );
          }
        })
        .catch((err) => {
          err.json().then(({ error }) => {
            // dispatch(setOnError({ value: true, message: res.error }));
            dispatch(
              setOnError({
                value: true,
                message: error.ErrorMessage,
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
        dispatch(
          setOnSuccess({
            value: true,
            message: 'Count Started Successfully.',
          })
        );
      })
      .catch((err) => {
        err.json().then(({ error }) => {
          dispatch(
            setOnError({
              value: true,
              message: error.ErrorMessage,
            })
          );
          // dispatch(setOnError({ value: true, message: res.error }));
        });
      });
  }

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
