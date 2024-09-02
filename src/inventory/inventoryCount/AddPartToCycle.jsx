import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PopUpDialog from '../../components/PopUpDialog';
import { globalStyles } from '../../style/globalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { getBinsData } from '../../utils/utils';
import MultiSelectAsync from '../../components/MultiSelectAsync';
import { addPartsDetailsToCycle, createMultiPartPayload, fetchPartByWhseBin, getCycleScheduleDesc } from '../Utils/InventoryUtils';
import { setIsLoading, setOnError, setOnSuccess } from '../../components/Loaders/toastReducers';
import Transferbackdrop from '../../components/Loaders/Transferbackdrop';
import SuccessBackdrop from '../../components/Loaders/SuccessBackdrop';
import ErrorBackdrop from '../../components/Loaders/ErrorBackdrop';

const AddPartToCycle = ({
  setScreen
}) => {
  const navigation = useNavigation();
  const { currentCycle, tagsData, selectedCycleDetails } = useSelector(
    (state) => state.inventory
  );

  const { isLoading, onSuccess, onError } = useSelector((state) => state.toast);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [formData, setFormData] = useState({ bins: [] })
  const dispatch = useDispatch()

  async function startAddProcess(bins) {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Adding Parts, Please wait',
      })
    );
    let partBins = [];
    let partBinObject = {}
    if (bins.length > 0) {
      // Create an array of promises
      const promises = bins.map(async (bin) => {
        // Fetch part information
        const part = await fetchPartByWhseBin(currentCycle.WarehouseCode, bin);
        // Store the result in partBins object
        partBins.push(part);
        partBinObject[bin] = part;
      });

      // Wait for all promises to complete
      await Promise.all(promises);
      const flattenedBins = partBins.flat();
      const filterParts = filterOutparts(flattenedBins)
      // Chunk the flattened array into batches
      const batches = chunkArray(filterParts, 500);

      // Process each batch sequentially
      // for (const batch of batches) {
      //     try {
      //         // Call addPartsDetailsToCycle for the current batch
      //         await addPartsDetailsToCycle(currentCycle, batch, dispatch);
      //         console.log('Batch processed successfully:', batch);
      //     } catch (error) {
      //         console.error('Error processing batch:', batch, error);
      //         // Optionally handle errors, e.g., stop processing further batches
      //         break; // If you want to stop processing on error
      //     }
      // }
      // All API calls have completed, and partBins is now populated
      await addPartsDetailsToCycle(currentCycle, filterParts, dispatch)
      navigation.goBack()
      // // test Code
      // console.log({filterParts})
      // dispatch(setOnSuccess({ value: true, message: "Parts Added to the Cycle." }));
      // You can use the partBins object here as needed
    }
  }

  function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  function filterOutparts(parts) {
    const existingCCDtls = selectedCycleDetails[0].CCDtls.map((data) => data.PartNum)
    let fltParts = []
    let fltBlank = []
    parts.forEach(o => {
      if (!existingCCDtls.includes(o.PartNum) && !fltBlank.includes(o.PartNum)) {
        fltParts.push(o)
        fltBlank.push(o.PartNum)
      }
    });
    return fltParts
  }


  return (
    <SafeAreaView style={styles.container}>
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
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Cycle Details</Text>
      </View>
      <View style={styles.detailsContainer}>
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
            <Text style={styles.value}>{getCycleScheduleDesc(currentCycle.CycleStatus)}</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}>
        <MultiSelectAsync
          value={formData?.bins}
          onChange={(itemValue) => {
            setFormData({ 'bins': itemValue });
          }}
          isLoading={false}
          label="cycleBin"
          handleRefresh={() => { }}
          fetchOptions={getBinsData}
          warehouse={currentCycle.WarehouseCode}
          multi={true}
          placeholder={'Select Bins to add its parts to the current cycle.'}
          apiLimit={300}
        />
      </View>
      <PopUpDialog
        visible={confirmAdd}
        setVisible={setConfirmAdd}
        handleCancel={() => setConfirmAdd(false)}
        handleOk={() => {
          startAddProcess(formData.bins);
          setConfirmAdd(false)
        }}
        title={`Add parts to Cycle Sequence ${currentCycle.CycleSeq}`}
        message={'Are you sure you want to Add all parts of the selected bins to the current cycle?'}
      />
      <TouchableOpacity
        style={styles.receiveButton}
        onPress={() => formData.bins.length > 0 ? setConfirmAdd(true) : dispatch(showSnackbar('Please select the cycle to proceed further'))}
      >
        <Text style={styles.receiveButtonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>

  );
};

// generateTagsAndStartCount

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiveButton: {
    backgroundColor: globalStyles.colors.success,
    padding: 18,
    borderRadius: 5,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    zIndex: 10,
    marginHorizontal: 'auto',
  },
  receiveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: globalStyles.colors.darkGrey,
    marginLeft: 20,
  },
  initialScreen: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: globalStyles.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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

export default AddPartToCycle;
