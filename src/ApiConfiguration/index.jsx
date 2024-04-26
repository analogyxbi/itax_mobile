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
import { useSelector } from 'react-redux';
import getClientErrorObject from '../utils/getClientErrorObject';
import ApiConfigTable from './components/ApiConfigTable';
import ApiConfigForm from './components/ApiConfigForm';
import axios from 'axios';

const initialFormData = {
  dp_url: '',
  auth_user: '',
  username: '',
  auth_password: true,
  S3_ACCESS_KEY_ID: '',
  S3_SECRET_ACCESS_KEY: '',
  S3_REGION: '',
  S3_BUCKET: '',
  JDBC_CONNECTION_STRING: '',
  JDBC_USERNAME: '',
  JDBC_PASSWORD: '',
};

const ApiConfiguration = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [formData, setFormData] = React.useState(initialFormData);
  const [apiConfigs, setApiconfigs] = useState([]);
  const [message, setMessage] = useState('Edit');
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
  async function handleSaveData(form, message) {
    console.log({ form, message });
    // if (message === 'New') {
    //   const postPayload = {
    //     ...form,
    //     jobs_list: JSON.stringify(form.jobs_list),
    //   };
    //   try {
    //     const { json } = await AnalogyxBIClient.post({
    //       endpoint: `/refresh_scheduler/create_refresh_config`,
    //       postPayload,
    //       stringify: false,
    //     });
    //     setApiconfigs((prev) => [...prev, { ...form, ...json }]);
    //   } catch (err) {
    //     getClientErrorObject(err).then((error) => {
    //       // actions.addDangerToast(t(error.message));
    //       // setIsLoading(false);
    //     });
    //   }
    // } else {
    //   const postPayload = {
    //     ...form,
    //     jobs_list: JSON.stringify(form.jobs_list),
    //   };
    //   try {
    //     const { json: json_1 } = await AnalogyxBIClient.post({
    //       endpoint: `/refresh_scheduler/update_refresh_config/${form.id}`,
    //       postPayload,
    //       stringify: false,
    //     });
    //     let data = [...refresh_config];
    //     const modified = data.findIndex((o) => o.id === form.id);
    //     if (modified != -1) {
    //       data.splice(modified, 1);
    //       data.unshift({ ...form, ...json_1 });
    //       setApiconfigs((prev_1) => [...data]);
    //     }
    //     // actions.addSuccessToast(t('Scheduler Updated Successfully'));

    //     setIsLoading(false);
    //   } catch (err_1) {
    //     console.log({ err });
    //     getClientErrorObject(err_1).then((error_1) => {
    //       console.log({ error });
    //       actions.addDangerToast(t(error_1.message));
    //       setIsLoading(false);
    //     });
    //   }
    // }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('called');
    await handleSaveData(removeNullValues({ ...formData }), message);
    setModalVisible(false);
    setFormData(initialFormData);
  };

  // useEffect(() => {
  //   AnalogyxBIClient.get({ endpoint: '/u/api/read' })
  //     .then(({ json }) => {
  //       let apiData = json.result.map((data) => ({
  //         ...data,
  //         label: data.username,
  //         value: data.id,
  //       }));
  //       setApiconfigs(() => [...apiData]);
  //     })
  //     .catch((err) =>
  //       props.actions.addDangerToast(
  //         t('An error occured while fetching users data')
  //       )
  //     );
  //     // https://wlsrv04/E10Dev/api/v1/
  // }, []);

  useEffect(() => {
    AnalogyxBIClient.get({
      endpoint: `/erp_woodland/show_woodland_apis_config`,
    })
      .then(({ json }) => {
        const data = json.api_config;
        setApiconfigs(() => data);
      })
      .catch((err) => {
        console.log({ err });
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
      .then((res) => {
        // console.log({ res });
        setApiconfigs(() => [{ ...formData, id: json.id }]);
        setModalVisible(false);
        setFormData(initialFormData);
      })
      .catch((err) => {
        console.log({ err });
        getClientErrorObject(err).then((res) => {
          // console.log({ res });
        });
        // setModalVisible(false);
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
    fontSize: 24,
    fontWeight: '700',
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
