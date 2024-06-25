import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../loginscreen/authSlice';
import { AnalogyxBIClient } from '@analogyxbi/connection';
// import { logoutUser } from '../loginscreen/actions/actions';
// import { clearAllTabs } from '../welcome/actions/actions';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const ProfileSettings = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [indicator, setIndicator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const getUrl = async () => {
    let urlData = await AsyncStorage.getItem('url');
    setUrl(() => urlData);
  };

  useState(() => {
    getUrl();
  }, []);

  async function removeItemValue(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (exception) {
      return false;
    }
  }

  const onLogoutPressed = () => {
    setLoading(true);
    AnalogyxBIClient.get({ endpoint: `/logout/` })
      .then((res) => {
        dispatch(logout(null));
        setIsAuthenticated(false);
        removeItemValue('csrf');
        removeItemValue('url');
        setLoading(false);
      })
      .catch((err) => {
        // alert(JSON.stringify(err));
        dispatch(logout(null));
        setIsAuthenticated(false);
        removeItemValue('csrf');
        removeItemValue('url');
        setLoading(false);
        setIndicator(false);
      });
  };

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
          <Text style={styles.headerText}>Profile Settings</Text>
        </View>
      </View>
      {indicator && (
        <View
          style={{
            flex: 1,
            position: 'absolute',
            marginLeft: windowWidth / 2,
            marginTop: windowHeight / 2,
          }}
        >
          <ActivityIndicator />
        </View>
      )}
      <Pressable
        onPress={() => navigation.navigate('UserInfo')}
        style={styles.option}
      >
        <FontAwesome
          name="user-o"
          size={18}
          color="black"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.optionText}>User Info</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('Help')}
        style={styles.option}
      >
        <Ionicons
          name="help-buoy-sharp"
          size={18}
          color="black"
          style={{ marginRight: 10 }}
        />

        <Text style={styles.optionText}>Help</Text>
      </Pressable>

      <View
        style={{
          width: windowWidth,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 50,
          opacity: 0.7,
        }}
      >
        <Text>Version 1.0.23</Text>
      </View>

      <TouchableOpacity
        onPress={() => onLogoutPressed()}
        style={styles.logoutButton}
      >
        <View>{loading ? <ActivityIndicator /> : <Text>Log Out</Text>}</View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'white',
    flex: 1,
  },

  header: {
    backgroundColor: 'white',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: windowHeight * 0.08,
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
    height: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionText: {
    fontSize: 14,
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
