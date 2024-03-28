import AsyncStorage from '@react-native-async-storage/async-storage';
import setupClient from '../../setup/setupClient';

//To Persist Logged in state. This function is dispatched from the App.js with a useEffect.
export const Init = () => {
  return async (dispatch) => {
    let csrf = await AsyncStorage.getItem('csrf');
    if (csrf !== null) {
      setupClient(csrf);
      dispatch({
        type: 'LOGIN',
        csrf,
      });
    }
  };
};

export const Login = (csrf, url) => {
  return async (dispatch) => {
    dispatch({
      type: 'LOGIN',
      csrf,
      url,
    });
  };
};

export const Logout = (value) => {
  return async (dispatch) => {
    await AsyncStorage.getAllKeys().then((keys) =>
      AsyncStorage.multiRemove(keys)
    );
    dispatch({
      type: 'LOGOUT',
      payoad: value,
    });
  };
};
