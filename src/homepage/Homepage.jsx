import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  Linking,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';
import { AnalogyxBIClient } from '@analogyxbi/connection';
import getClientErrorObject from '../utils/getClientErrorObject';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../loginscreen/authSlice';
import HomepageIcon from '../ApiConfiguration/components/HomepageIcon';
import { globalStyles } from '../style/globalStyles';
import { Snackbar } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Homepage() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { visible, message } = useSelector((state) => state.snackbar); // Add this line

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
  }, []);
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.rightIcon}
          onPress={() => navigation.navigate('ProfileSettings')}
        >
          <Feather name="user" size={24} color="black" />
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
          name="Job Receipt"
          icon={<Ionicons name="receipt" style={styles.iconImage} />}
        />
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
    width: '60%',
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
});
