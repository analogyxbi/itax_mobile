import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const UserInfo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState([]);
  const [url, setUrl] = useState('');

  const getUserData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let url = await AsyncStorage.getItem('url');
    setUserData(() => JSON.parse(user));
    setUrl(() => url);
  };

  useEffect(() => {
    getUserData();
  }, []);

  //prettier-ignore
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.header}>
        <Ionicons
          onPress={() => navigation.goBack()}
          name="chevron-back"
          size={24}
          color="#4287F5"
          style={{ position: 'absolute', marginLeft: 10, zIndex: 1 }}
        />
        <View style={{ alignItems: 'center', width: windowWidth }}>
          <Text style={styles.headerText}>User Info</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={{...styles.dataText, fontSize: 16, color: '#4287F5'}}>Logged in as: {userData?.username}</Text>
        <Text style={{color: 'gray'}}>Connected via: {url}</Text>
        <Text style={styles.dataText}>First name: {userData?.firstName}</Text>
        <Text style={styles.dataText}>Last name: {userData?.lastName}</Text>
        <Text style={styles.dataText}>Email: {userData?.email}</Text>
      </View>
    </SafeAreaView>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
    flex: 1,
  },

  content: {
    backgroundColor: '#f1f1f1',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    minHeight: 150,
  },

  dataText: {
    marginVertical: 3,
    fontSize: 15,
    fontWeight: '500',
  },

  header: {
    backgroundColor: 'white',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: windowHeight * 0.06,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    paddingLeft: 10,
  },

  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },

  option: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
    padding: 10,
    width: windowWidth * 0.95,
    height: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionText: {
    fontSize: 16,
    // marginLeft: 15,
    flexDirection: 'column',
  },

  logoutButton: {
    backgroundColor: 'orange',
    alignItems: 'center',
    marginTop: 50,
    width: windowWidth * 0.6,
    alignSelf: 'center',
    padding: 5,
    borderRadius: 5,
  },
});
