import 'react-native-gesture-handler';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

import * as React from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/loginscreen/LoginScreen';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import Homepage from './src/homepage/Homepage';
import ProfileSettings from './src/profile/ProfileSettings';
import { initAuth } from './src/loginscreen/actions/actions';


// import { enableFreeze } from 'react-native-screens';

const Stack = createNativeStackNavigator();

const AuthStack = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home">
      {props => <LoginScreen {...props} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const MainStack = ({ isAuthenticated, setIsAuthenticated }) => {
  // enableFreeze(true);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homepage" component={Homepage} />
      <Stack.Screen name="ProfileSettings">
      {props => <ProfileSettings {...props} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
      </Stack.Screen>
      {/* <Stack.Screen name="ProfileSettings" component={ProfileSettings} /> */}
    </Stack.Navigator>
  );
};

const RootNavigation = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Define isAuthenticated state
  //Since this is inside the provider we have access to store.
  //Getting values from redux store to switch the between Auth & Main stacks based on csrf
  const csrf = useSelector((state) => state.auth.csrf); // Access csrf from the auth slice
  const dispatch = useDispatch();

  useEffect(() => {
      dispatch(initAuth());
  }, []);

  useEffect(() => {
    // Update isAuthenticated state based on csrf value
    setIsAuthenticated(csrf !== null);
  }, [csrf]); 
  

  return (
    <NavigationContainer>
       {isAuthenticated === false ? (
        <AuthStack isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <MainStack  isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
      )}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigation />
     </Provider>
  );
};

export default App;

// export ANDROID_SDK_ROOT=/home/satendra/Android/Sdk
