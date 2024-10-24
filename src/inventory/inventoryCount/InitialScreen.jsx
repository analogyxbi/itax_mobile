import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PopUpDialog from '../../components/PopUpDialog';
import VarianceReport from '../../components/VarianceReport';
import { globalStyles } from '../../style/globalStyles';
import { showSnackbar } from '../../Snackbar/messageSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getCycleScheduleDesc } from '../Utils/InventoryUtils';

const InitialScreen = ({
  setScreen,
  currentCycle,
  generateTagsAndStartCount,
  postCount,
}) => {
  const navigation = useNavigation();
  const [postCountData, setPostCountData] = useState(false);
  const [genTags, setGenTags] = useState(false);
  const { tagsData } = useSelector(
    (state) => state.inventory
  );

  const dispatch = useDispatch()

  return (
   
    <SafeAreaView style={styles.container}>
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
      <ScrollView contentContainerStyle={styles.initialScreen}>
      <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              currentCycle.CycleStatus > 0
                ? 'grey'
                : globalStyles.colors.success,
          }}
          onPress={() => {
            if(currentCycle.CycleStatus <= 0){
              navigation.navigate('add_part_to_cycle')
            }else{
              dispatch(showSnackbar("Parts can only be added on a Scheduled Cycle Status."))
            }
          }}
        >
          <Text style={styles.buttonText}>Add Parts By BinNum</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              currentCycle.CycleStatus > 1
                ? 'grey'
                : globalStyles.colors.success,
          }}
          onPress={() => {
            setGenTags(true)
          }}
          disabled={currentCycle.CycleStatus > 1}
        >
          <Text style={styles.buttonText}>Initiate Counting Process</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              currentCycle.CycleStatus == 6
                ? 'grey'
                : globalStyles.colors.success,
          }}
          disabled={currentCycle.CycleStatus === 6}
          onPress={() => {
            if(tagsData.length>0){
              setScreen('counting')
            }else{
              dispatch(showSnackbar('No tags Available for Count. Please Initiale the counting process'))
            }
          }}
        >
          <Text style={styles.buttonText}>Count</Text>
        </TouchableOpacity>

        <VarianceReport />
        <TouchableOpacity
          onPress={() => setPostCountData(true)}
          style={{
            ...styles.button,
            backgroundColor:
              currentCycle.CycleStatus == 6
                ? 'grey'
                : globalStyles.colors.success,
          }}
          disabled={currentCycle.CycleStatus === 6}
        >
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </ScrollView>
      <PopUpDialog
        visible={postCountData}
        setVisible={setPostCountData}
        handleCancel={() => setPostCountData(false)}
        handleOk={() => {
          postCount();
          setPostCountData(false);
        }}
        title="Post Count Data"
        message={'Are you sure you want to Post Count?'}
      />
      <PopUpDialog
        visible={genTags}
        setVisible={setGenTags}
        handleCancel={() => setGenTags(false)}
        handleOk={() => {
          generateTagsAndStartCount();
          setGenTags(false)
        }}
        title="Initiate Count Process"
        message={'Are you sure you want to generate tags and start count?'}
      />
    </SafeAreaView>
   
  );
};


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

export default InitialScreen;
