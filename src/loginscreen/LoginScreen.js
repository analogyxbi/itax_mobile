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
  ActivityIndicator,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';
// import { loginUser } from './actions/actions';
import axios from 'axios';
import JSSoup from 'jssoup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import setupClient from '../setup/setupClient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';

const LoginScreen = ({ isAuthenticated, setIsAuthenticated }) => {
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState(''); //gets overwritten when value is edited
  const dispatch = useDispatch();
  const [csrf, setCsrf] = useState('');
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();

  const UNPWCheck = () => {
    if (!username || !password || !url) {
      Alert.alert('Please provide the missing credentials');
      return;
    }
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('X-XSRF-TOKEN', '');

    var data = {
      password: password,
      provider: 'db',
      refresh: true,
      username: username,
    };

    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `http://${url}/api/v1/security/login/`,
      data: data,
      Headers: myHeaders,
    };

    axios(config)
      .then(function (response) {
        alert('First login success');
        onLoginhandler();
      })
      .catch(function (error) {
        console.log('First Error' + JSON.stringify(error));
        // const csrf =
        //   'IjU5NDdlOTdiNWQ4MjU0YjJjMWE3ZTI0Zjk2N2Y5NGVlY2U2OGRkODQi.ZiebCQ.jhphhb5RUKzz3_OynmaaGkz1mYM';
        // setupClient(csrf, url);
        // dispatch(login({ csrf, url }));
        // AsyncStorage.multiSet([
        //   ['csrf', csrf],
        //   ['url', url],
        // ]);
        // setLoading(false);
        // setIsAuthenticated(true);
        setLoading(false);
      });
  };

  const onLoginhandler = async (csrf) => {
    let payload = [];
    const csrf_token = csrf;
    payload = new FormData();
    payload.append('username', username);
    payload.append('password', password);
    payload.append('csrf_token', csrf_token);
    axios({
      method: 'POST',
      url: `http://${url}/login_app/`,
      data: payload,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'multipart/form-data',
        Referer: `http://${url}/login_app/`,
      },
    })
      .then((res) => {
        if (!res.data.login) {
          Alert.alert('Invalid Credentials, Please try again.');
          setLoading(false);
        } else {
          // setupClient(csrf_token, url);
          dispatch(login({ csrf: csrf_token, url }));
          setLoading(false);
          setIsAuthenticated(true);
        }
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.data) {
          if (error.response?.data?.message) {
            console.log('Error message:');
            alert(error.response.data.message);
            // setLoading(false);
          } else {
            alert('An error occurred. Please try again later.');
          }
        } else if (error.request) {
          alert(
            'Network error. Please check your org url or internet connection.'
          );
        } else {
          // Something happened in setting up the request that triggered the error
          console.log('Error Message:', error.message);
          alert('An unexpected error occurred.');
        }
        setLoading(false);
      });
  };

  function fetchCSRF() {
    setLoading(true);
    let myHeaders = new Headers();
    myHeaders.append(
      'Accept',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    );
    myHeaders.append('X-XSRF-TOKEN', '');
    axios
      .get(`http://${url}/login`, {
        headers: myHeaders,
      })
      .then((res) => {
        let soup = new JSSoup(res.data);
        let csrf = soup.find('input', { id: 'csrf_token' }).attrs.value;
        setCsrf(csrf);
        onLoginhandler(csrf);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log({ error });
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log('Error Response Data:', error.response.data);
          // console.log('Error Response Status:', error.response.status);
          // Example: Show a generic message based on the status code
          if (error.response.status === 404) {
            alert('Resource not found.');
          } else {
            alert('An error occurred. Please try again later.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          // console.log('Error Request:', error.request);
          alert(
            'Network error. Please check your org url or internet connection.'
          );
        } else {
          // Something happened in setting up the request that triggered the error
          // console.log('Error Message:', error.message);
          alert('An unexpected error occurred.');
        }
        setLoading(false);
      });
  }

  // useEffect(() => {
  //   var myHeaders = new Headers();
  //   myHeaders.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
  //   myHeaders.append('X-XSRF-TOKEN',"")
  //   axios
  //     .get(`http://${url}/login/`, {
  //       headers:myHeaders
  //     })
  //     .then((res) => {
  //       let soup = new JSSoup(res.data);
  //       let csrf = soup.find('input', { id: 'csrf_token' }).attrs.value;
  //       setCsrf(csrf);
  //      alert("FETCHED CSRF")
  //     })
  //     .catch((err) => {
  //       console.log("CSRF Error", JSON.stringify(err))
  //     });
  // }, [url]);

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
              onChangeText={setUrl}
              keyboardType={'url'}
              spellCheck={false}
              autoCapitalize="none"
              style={styles.urlInput}
              textAlign={'center'}
              placeholder={'Your organization URL'}
              clearButtonMode={'while-editing'}
              value={url}
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
                onPress={() => setPasswordHidden(!passwordHidden)}
              >
                <MaterialCommunityIcons
                  name={eyeVisible()}
                  size={20}
                  color="#232323"
                />
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={() => fetchCSRF()}
              style={styles.loginButton}
            >
              {loading === true ? (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={styles.loginText}>Please Wait... </Text>
                  <ActivityIndicator color={'white'} />
                </View>
              ) : (
                <Text style={styles.loginText}> Sign In </Text>
              )}
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
