import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';
import { Login } from './actions/actions';
import axios from 'axios';
import JSSoup from 'jssoup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import setupClient from '../setup/setupClient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = ({isAuthenticated, setIsAuthenticated}) => {
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('app.analogyx.com'); //gets overwritten when value is edited

  const [csrf, setCsrf] = useState('');
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();

  const UNPWCheck = () => {
    if (!username || !password || !url) {
      Alert.alert('Please provide the missing credentials');
      return;
    }
    setLoading(true);
    console.log('unpw check ran');
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var data = JSON.stringify({
      password: password,
      provider: 'db',
      refresh: true,
      username: username,
    });

    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://${url}/api/v1/security/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        onLoginhandler();
      })
      .catch(function (error) {
        alert('Wrong Credentials');
      });
  };

  const onLoginhandler = async () => {
    let payload = [];
    const csrf_token = csrf;
    payload = new FormData();
    payload.append('username', username);
    payload.append('password', password);
    payload.append('csrf_token', csrf_token);
    axios({
      method: 'post',
      url: `https://${url}/login/`,
      data: payload,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'multipart/form-data',
        Referer: `https://${url}/login/`,
      },
    })
      .then((res) => {
        if (res.data.includes('Invalid login. Please try again')) {
          Alert.alert('Timeout. Please try again.');
          setLoading(false);
        } else {
          setupClient(csrf_token, url);
          // dispatch(Login(csrf_token, url));
          AsyncStorage.multiSet([
            ['csrf', csrf],
            ['url', url],
          ]);
          setLoading(false);
          setIsAuthenticated(true)
          console.log("User logged innnnnnnnnnnnnnnnnnnnnnnnnnnn")
        }
      })
      .catch((err) => {
        // Alert.alert('Error', JSON.stringify(err));
        console.log('Please check the entered credentials.', err);
        Alert.alert('Error', 'Please check the entered credentials.');
        setLoading(false);
      });
  };

  useEffect(() => {
    axios
      .get(`https://${url}/login/`)
      .then((res) => {
        let soup = new JSSoup(res.data);
        let csrf = soup.find('input', { id: 'csrf_token' }).attrs.value;
        setCsrf(csrf);
        console.log('csrfLOG', csrf);
      })
      .catch((err) => console.log('csrf set err', err));
  }, [url]);

  const passwordVisibilityHandler = () => {
    if (passwordHidden == true) {
      return true;
    } else return false;
  };

  const eyeVisible = () => {
    if (passwordHidden == true) {
      return 'eye-off';
    } else return 'eye';
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1 }}
      enableOnAndroid={false}
      scrollEnabled={false}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={60}
      extraHeight={60}
    >
      <StatusBar style="dark" />
      <ImageBackground
        source={require('../../images/loginBackground.jpg')}
        style={styles.main}
      >
        <View style={styles.container}>
          <BlurView intensity={80} style={styles.loginBox}>
            <Image
              source={require('../../images/analogyxbi-logo-horiz.png')}
              style={styles.logo}
            ></Image>

            <Text style={styles.welcomeText}>Login to your account</Text>

            <TextInput
              defaultValue="app.analogyx.com" //gets overwritten
              onChangeText={setUrl}
              keyboardType={'url'}
              spellCheck={false}
              autoCapitalize="none"
              style={styles.urlInput}
              textAlign={'center'}
              placeholder={'Your organization URL'}
              clearButtonMode={'while-editing'}
            />

            <TextInput
              onChangeText={setUsername}
              keyboardType={'email-address'}
              spellCheck={false}
              autoCapitalize="none"
              style={styles.usernameInput}
              placeholder={'User Name or Email'}
              clearButtonMode={'while-editing'}
            />

            <View style={styles.passwordArea}>
              <TextInput
                secureTextEntry={passwordVisibilityHandler()}
                onChangeText={setPassword}
                spellCheck={false}
                autoCapitalize="none"
                style={styles.passwordInput}
                placeholder={'Password'}
              />
              <Pressable
                style={styles.eye}
                onPress={() => (
                  setPasswordHidden(!passwordHidden),
                  console.log(passwordHidden)
                )}
              >
                <MaterialCommunityIcons
                  name={eyeVisible()}
                  size={20}
                  color="#232323"
                />
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={() => UNPWCheck()}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                {loading === true ? `Signing In...` : `Sign In`}
              </Text>
            </TouchableOpacity>
          </BlurView>
          <Text
            style={{
              position: 'absolute',
              bottom: 60,
              opacity: 0.5,
            }}
          >
            Analogyx BI Private Limited
          </Text>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  main: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  loginBox: {
    backgroundColor: 'transparent',
    width: '90%',
    height: '70%',
    borderRadius: 10,
    overflow: 'hidden',
  },

  logo: {
    width: 300,
    height: 60,
    alignSelf: 'center',
    marginTop: 40,
  },

  welcomeText: {
    marginTop: 40,
    alignSelf: 'center',
    fontSize: 18,
    color: '#4287F5',
    fontWeight: '500',
  },

  urlInput: {
    backgroundColor: 'white',
    // borderColor: 'lightgray',
    // borderWidth: 1,
    marginTop: 30,
    height: 40,
    width: 300,
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    fontWeight: '600',
    fontSize: 16,
    color: '#575757',
  },

  usernameInput: {
    backgroundColor: 'white',
    // borderColor: 'lightgray',
    // borderWidth: 1,
    marginTop: 10,
    height: 40,
    width: 300,
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    fontWeight: '500',
  },

  passwordInput: {
    backgroundColor: 'white',
    // borderColor: 'lightgray',
    // borderWidth: 1,
    marginTop: 10,
    height: 40,
    width: 300,
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    fontWeight: '500',
  },

  loginButton: {
    backgroundColor: '#4287F5',
    width: 300,
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },

  loginText: {
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },

  passwordArea: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  eye: {
    alignSelf: 'flex-end',
    right: '10%',
    bottom: '42%',
    zIndex: 999,
  },
});
