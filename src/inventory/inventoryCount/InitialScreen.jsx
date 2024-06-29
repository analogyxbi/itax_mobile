import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PopUpDialog from '../../components/PopUpDialog';
// import PDFComponent from '../../components/PDFComponent';r
import VarianceReport from '../../components/VarianceReport';

const InitialScreen = ({
  setScreen,
  currentCycle,
  generateTagsAndStartCount,
  postCount,
}) => {
  const navigation = useNavigation();
  const [postCountData, setPostCountData] = useState(false);
  const [genTags, setGenTags] = useState(false);

  return (
    <View style={styles.container}>
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
            <Text style={styles.value}>{currentCycle.CycleStatusDesc}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.initialScreen}>
        <TouchableOpacity
          style={{
            ...styles.button,
            backgroundColor:
              currentCycle.CycleStatus > 1
                ? 'grey'
                : globalStyles.colors.success,
          }}
          onPress={() => setGenTags(true)}
          disabled={currentCycle.CycleStatus > 1}
        >
          <Text style={styles.buttonText}>Initiate Counting Process</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScreen('counting')}
        >
          <Text style={styles.buttonText}>Count</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Print Report</Text>
        </TouchableOpacity> */}
        <VarianceReport />
        <TouchableOpacity
          onPress={() => setPostCountData(true)}
          style={styles.button}
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
        }}
        title="Initiate Count Process"
        message={'Are you sure you want to generate tags and start count?'}
      />
    </View>
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
