import 'react-native-gesture-handler';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);

import * as React from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer'
import LoginScreen from './src/loginscreen/LoginScreen';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import store from './src/store';
import Homepage from './src/homepage/Homepage';
import ProfileSettings from './src/profile/ProfileSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Users from './src/users/Users';
import { login } from './src/loginscreen/authSlice';
import setupClient from './src/setup/setupClient';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
// import { initAuth } from './src/loginscreen/actions/actions';


// import { enableFreeze } from 'react-native-screens';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const ReceivingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Receiving" component={Users} />
    <Stack.Screen name="POReceipt" component={Users} />
    <Stack.Screen name="Orders" component={Users} />
  </Stack.Navigator>
);

const DrawerRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
  // enableFreeze(true);
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen
        name="Home"
        component={Homepage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Users"
        component={Users}
        options={{
          drawerLabel: 'Users',
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Shipping"
        component={Homepage}
        options={{
          drawerLabel: 'Shipping',
          drawerIcon: ({ color, size }) => (
            <FontAwesome5 name="shipping-fast" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Receiving"
        component={ReceivingNavigator}
        options={{
          drawerLabel: 'Receiving',
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="inbox" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Trackers"
        component={Users}
        options={{
          drawerLabel: 'Trackers',
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="map-marker" size={size} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen name="ProfileSettings" component={ProfileSettings} /> */}
    </Drawer.Navigator>
  );
};
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
      <Stack.Screen name="Homepage" component={DrawerRoutes} />
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

  const Init = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    if (csrf !== null) {
      const url = 'app.analogyx.com';
      setupClient(csrf, url);
      dispatch(login({ csrf, url }));
      AsyncStorage.multiSet([
        ['csrf', csrf],
        ['url', url],
      ]);
      setIsAuthenticated(true)
    }
  };

  useEffect(() => {
    Init();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated === false ? (
        <AuthStack isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <MainStack isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      )}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PaperProvider>
        <RootNavigation />
      </PaperProvider>
    </Provider>
  );
};

export default App;

// export ANDROID_SDK_ROOT=/home/satendra/Android/Sdk
