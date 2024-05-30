import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
  ToastAndroid,
} from 'react-native';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../style/globalStyles';
import { useNavigation } from '@react-navigation/native';
import _ from 'lodash';
import getClientErrorObject from '../utils/getClientErrorObject';
import ApiConfigTable from './components/ApiConfigTable';
import ApiConfigForm from './components/ApiConfigForm';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';
const initialFormData = {
  base_url: '',
  api_username: '',
  api_password: '',
};

const ApiConfiguration = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [formData, setFormData] = React.useState(initialFormData);
  const [apiConfigs, setApiconfigs] = useState([]);
  const [message, setMessage] = useState('Edit');
  const dispatch = useDispatch();
  // const userData = useSelector((state) => state.auth.user_data);

  function removeNullValues(form) {
    let obj = form;
    for (let key in obj) {
      if (obj[key] === null) {
        obj[key] = '';
      }
    }
    return obj;
  }

  useEffect(() => {
    AnalogyxBIClient.get({
      endpoint: `/erp_woodland/show_woodland_apis_config`,
    })
      .then(({ json }) => {
        const data = json.api_config;
        setApiconfigs(() => data);
        dispatch(showSnackbar('Details Fetched Successfully'));
      })
      .catch((err) => {
        getClientErrorObject(err).then((res) => {
          dispatch(showSnackbar(res.error));
        });
      });
  }, []);

  function saveFormData(e) {
    if (
      !formData.base_url ||
      !formData.api_username ||
      !formData.api_password
    ) {
      return console.log('Please Enter the Required fields');
    }
    AnalogyxBIClient.post({
      endpoint: `/erp_woodland/create_or_update_woodland_api_config`,
      postPayload: formData,
      stringify: false,
    })
      .then(({ json }) => {
        // console.log({ res });
        setApiconfigs(() => [{ ...formData, id: json.id }]);
        setModalVisible(false);
        setFormData(initialFormData);
        dispatch(showSnackbar('Configuration saved.'));
      })
      .catch((err) => {
        getClientErrorObject(err).then((res) => {
          dispatch(showSnackbar(res.error));
        });
      });
  }

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
        <Text style={styles.heading}>Api Configuration</Text>
        <Pressable
          // style={[styles.button, styles.buttonClose]}
          onPress={() => {
            setModalVisible(!modalVisible);
            setMessage('New');
          }}
        >
          <AntDesign
            name="pluscircleo"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
      </View>
      <ApiConfigTable
        setModalVisible={setModalVisible}
        setMessage={setMessage}
        message={message}
        apiConfigs={apiConfigs || []}
        roleData={apiConfigs || []}
        setFormData={setFormData}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        style={styles.modal}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.header}>
            <Pressable onPress={() => setModalVisible(!modalVisible)}>
              <Ionicons
                name="chevron-back-outline"
                size={24}
                color={globalStyles.colors.darkGrey}
              />
            </Pressable>
            <Text style={styles.heading}>Api Configuration</Text>
            <Pressable onPress={saveFormData}>
              <FontAwesome
                name="save"
                size={24}
                color={globalStyles.colors.primary}
              />
            </Pressable>
          </View>
          <View>
            <ApiConfigForm
              formData={formData}
              // usersData={userData?.users_data || []}
              setFormData={setFormData}
              saveFormData={saveFormData}
              // roleData={userData?.role_data}
              // userGroups={userData?.user_group_data || []}
              // timeZone={userData?.timezone}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: globalStyles.colors.darkGrey,
  },
  modal: {
    padding: 10,
    backgroundColor: 'white',
  },
  userItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'white',
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginTop: 22,
  },
  modalView: {
    // margin: 20,
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    // padding: 35,
    // alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },
  modalHeader: {},
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ApiConfiguration;
