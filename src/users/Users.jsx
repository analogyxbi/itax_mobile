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
import UsersForm from './components/UsersForm';
import UsersTable from './components/UsersTable';
import { useNavigation } from '@react-navigation/native';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import getClientErrorObject from '../utils/getClientErrorObject';
import { setUserData } from '../loginscreen/authSlice';
const initialFormData = {
  first_name: '',
  last_name: '',
  username: '',
  active: true,
  email: '',
  phone: '',
  roles: '',
  time_zone: '',
  user_group: '',
  password: '',
  confirm_password: '',
};

const Users = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [formData, setFormData] = React.useState(initialFormData);
  const userData = useSelector((state) => state.auth.user_data);
  const dispatch = useDispatch();

  useEffect(() => {
    const endpoint = `/user_management/users?json=true`;
    AnalogyxBIClient.get({ endpoint })
      .then(({ json }) => {
        dispatch(setUserData(json));
      })
      .catch((err) => {
        getClientErrorObject(err).then((res) => {
          ToastAndroid.show(t(res), ToastAndroid.SHORT);
        });
      });
  }, []);

  const handleValidate = () => {
    if (_.isEmpty(formData)) {
      return true;
    }
    if (
      !formData.first_name ||
      formData.first_name?.length === 0 ||
      !formData.last_name ||
      formData.last_name.length === 0 ||
      !formData.username ||
      formData.username.length === 0 ||
      !formData.email ||
      !/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(formData.email)
      // ||
      // (formData.roles?.length > 0 && formData?.roles[0]?.value === '') ||
      // usersData.find(
      //   (data) =>
      //     data.email === formData.email && data.id != selectedFormData?.id
      // )
      // !formData.user_group ||
      // formData.user_group.length === 0
    ) {
      return true;
    }

    return false;
  };

  const saveUser = () => {
    const data = { ...formData };

    if (handleValidate) {
      // const roles = _.isArray(data.roles)
      //   ? [data.roles[0].value]
      //   : [data.roles.value];
      let payload = {
        ...data,
        timezone_id: data?.time_zone,
        roles: JSON.stringify([data.roles]),
        user_group: '[]',
      };
      AnalogyxBIClient.post({
        endpoint: `/user_management/create`,
        postPayload: payload,
        stringify: false,
      })
        .then(({ json }) => {
          // onSaveData({ ...data, id: json.id }, type);
          console.log('Successsss');
          ToastAndroid.show(t(json.message), ToastAndroid.SHORT);
          setFormData(initialFormData);
          setModalVisible(false);
        })
        .catch((err) =>
          getClientErrorObject(err).then((res) => {
            console.log({ err });
            ToastAndroid.show(t(res), ToastAndroid.SHORT);
          })
        );
      // setModalVisible(!modalVisible)
    }
  };

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
        <Text style={styles.heading}>Users</Text>
        <Pressable
          // style={[styles.button, styles.buttonClose]}
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <AntDesign
            name="pluscircleo"
            size={24}
            color={globalStyles.colors.darkGrey}
          />
        </Pressable>
      </View>
      {/* <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <UserItem user={item} />}
      /> */}
      <UsersTable
        users={userData?.users_data || []}
        roleData={userData?.role_data || []}
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
            <Text style={styles.heading}>Create User</Text>
            <Pressable onPress={saveUser}>
              <FontAwesome
                name="save"
                size={24}
                color={globalStyles.colors.primary}
              />
            </Pressable>
          </View>
          <View>
            <UsersForm
              formData={formData}
              usersData={userData?.users_data || []}
              setFormData={setFormData}
              roleData={userData?.role_data || []}
              userGroups={userData?.user_group_data || []}
              timeZone={userData?.timezone || []}
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

export default Users;
