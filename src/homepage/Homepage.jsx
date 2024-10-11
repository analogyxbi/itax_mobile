import { AnalogyxBIClient } from '@analogyxbi/connection';
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HomepageIcon from '../ApiConfiguration/components/HomepageIcon';
import { setCompanies, setCompany, setUserData } from '../loginscreen/authSlice';
import { globalStyles } from '../style/globalStyles';
import getClientErrorObject from '../utils/getClientErrorObject';
import { showSnackbar } from '../Snackbar/messageSlice';
import { Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Homepage() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { visible, message } = useSelector((state) => state.snackbar); // Add this line
  const {companies, company} = useSelector(state => state.auth);
  const [modalVisible, setIsModalVisible] = useState(false);

  const fetchCompanies = async() =>{
    let localStorageCompany;
    const postPayload = {
      epicor_endpoint:
        "/Erp.BO.CompanySvc/Companies",
      request_type: "GET",
    };
    try {
      localStorageCompany = await AsyncStorage.getItem('company');
      dispatch(setCompany(JSON.parse(localStorageCompany)))
      AnalogyxBIClient.post({
        endpoint: `/erp_woodland/resolve_api`,
        postPayload,
        stringify: false,
      })
        .then(({ json }) => {
          dispatch(setCompanies(json.data.value));
          if(!company && !localStorageCompany){
            dispatch(setCompany(json?.data?.value && json?.data?.value[0]?.Company1))
            AsyncStorage.setItem('company', json?.data?.value && JSON.stringify(json?.data?.value[0]?.Company1));
          }
          dispatch(showSnackbar("Companies List refreshed"));
        })
        .catch((err) => {
          // setLoading(false);
          dispatch(
            showSnackbar(
              "Error getting the list of Companies",
              JSON.stringify(err)
            )
          );
        });
    } catch (err) {
      dispatch(
        showSnackbar(
          "Error getting the list of warehouses",
          JSON.stringify(err)
        )
      );
    }
  }

  useEffect(() => {
    const endpoint = `/user_management/users?json=true`;
    AnalogyxBIClient.get({ endpoint })
      .then(({ json }) => {
        dispatch(setUserData(json));
      })
      .catch((err) => {
        getClientErrorObject(err).then((res) =>
          ToastAndroid.show(t(res), ToastAndroid.SHORT)
        );
      });
      fetchCompanies();
  }, []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{company ? `Company: ${company}` : "Select Company"}</Text>
          <FlatList
            style={{width: "100%"}}
            data={companies?.map(comp => ({id: comp.Company1, name: comp.Company1}))}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={()=> {
                dispatch(setCompany(item?.name))
                AsyncStorage.setItem('company', JSON.stringify(item?.name));
                setIsModalVisible(false);
                }}>
                <View style={styles.companyItem} >
                  <Text style={styles.companyName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={()=> setIsModalVisible(false)} />
        </View>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.leftIcon}
        >
          <Entypo name="menu" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/woodland_logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Chip style={{marginRight: 10}} onPress={() => setIsModalVisible(true)}>
          {company}
        </Chip>
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={() => navigation.navigate('ProfileSettings')}
        >
          {<Feather name="user" size={24} color="black" />}
        </TouchableOpacity>
      </View>
      <View style={[globalStyles.dFlexR, styles.homepageIcons]}>
        <HomepageIcon
          name="Inventory Transfer"
          onPress={() => navigation.navigate('inventory_transfer')}
          icon={<MaterialIcons name="inventory" style={styles.iconImage} />}
        />
        <HomepageIcon
          name="Inventory Count"
          onPress={() => navigation.navigate('inventory_count')}
          icon={<MaterialIcons name="production-quantity-limits" style={styles.iconImage}/>}
        />
        <HomepageIcon
          name="PO Receipt"
          onPress={() => navigation.navigate('po_reciept')}
          icon={<FontAwesome5 name="receipt" style={styles.iconImage} />}
        />
        <HomepageIcon
          name="Quantity Adjustments"
          onPress={() => navigation.navigate('quantity_adjustments')}
          icon={<MaterialCommunityIcons name="counter" style={styles.iconImage} />}
        />
        <HomepageIcon
          name="Miscellaneous Material"
          onPress={() => navigation.navigate('miscellaneous_material')}
          icon={<MaterialIcons name="miscellaneous-services" style={styles.iconImage} />}
        />
        {/* <HomepageIcon
          name="Job Receipt"
          icon={<Ionicons name="receipt" style={styles.iconImage} />}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonBehind: {
    flex: 1,
    marginHorizontal: 5,
    zIndex: 1,
  },
  heading: {
    fontSize: 30,
    color: globalStyles.colors.primary,
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    height: 30,
  },
  leftIcon: {
    marginRight: 'auto',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '60%',
  },
  rightIcon: {
    marginLeft: 'auto',
  },
  closeButton: {
    backgroundColor: '#B628F8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homepageIcons: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  iconImage: {
    color: globalStyles.colors.success,
    fontSize: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  companyName: {
    fontSize: 18,
  },
});
