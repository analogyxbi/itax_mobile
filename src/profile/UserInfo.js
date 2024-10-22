import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { globalStyles } from '../style/globalStyles';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const UserInfo = () => {
  const navigation = useNavigation();
  const userData = useSelector((state) => state.auth.user_data);
  console.log("userdata", userData)
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
        <View
          style={{
            backgroundColor: '#f4f4f4',
            padding: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Image
            width={'100%'}
            style={{ width: 200, height: 200, borderRadius: 100 }}
            source={
              userData?.user?.profile_pic
                ? { uri: `data:image/jpg;base64,${userData?.user?.profile_pic}` }
                : require('../../assets/profile_dummy.webp')
            }
          />
        </View>
        <Text style={{ ...styles.dataText, fontSize: 18, color: '#4287F5' }}>Logged in as: {userData?.user?.username}</Text>
        {/* <Text style={{color: 'gray'}}>Connected via: {url}</Text> */}
        <Text style={styles.dataText}>First name: {userData?.user?.firstName}</Text>
        <Text style={styles.dataText}>Last name: {userData?.user?.lastName}</Text>
        <Text style={styles.dataText}>Email: {userData?.user?.email}</Text>
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
    // backgroundColor: '#f1f1f1',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    minHeight: 150,
  },

  dataText: {
    marginVertical: 3,
    fontSize: 17,
    fontWeight: '500',
    color: globalStyles.colors.darkGrey,
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
    fontSize: 18,
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
