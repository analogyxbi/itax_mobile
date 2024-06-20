import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
LogBox.ignoreAllLogs(true);

import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useEffect } from 'react';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Homepage from './src/homepage/Homepage';
import LoginScreen from './src/loginscreen/LoginScreen';
import { login } from './src/loginscreen/authSlice';
import ProfileSettings from './src/profile/ProfileSettings';
import setupClient from './src/setup/setupClient';
import store from './src/store';
import Users from './src/users/Users';
// import { initAuth } from './src/loginscreen/actions/actions';
import {
  DrawerContentScrollView,
  DrawerItemList,
  createStackNavigator,
} from '@react-navigation/drawer';
import { Image, Text, View } from 'react-native';
import Colors from './utils/Colors';
import { StyleSheet } from 'react-native';
import { AppRegistry } from 'react-native';
import CustomDrawer from './utils/CustomDrawer';
import { ScreensArray } from './src/constants/constants';
import Icon from './src/components/Icons';
import POReceipt from './src/receiving/POReceipt';
import { globalStyles } from './src/style/globalStyles';
import InventoryTransfer from './src/inventory/InventoryTransfer';
import { hideSnackbar } from './src/Snackbar/messageSlice';
import * as SplashScreen from 'expo-splash-screen';
import CycleCountPeriod from './src/inventory/inventoryCount/CycleCountPeriod';
import InventoryCount from './src/inventory/inventoryCount';
import CycleSchedule from './src/inventory/inventoryCount/CycleSchedule';
import SelectCycle from './src/inventory/inventoryCount/SelectCycle';
import CycleApp from './src/inventory/inventoryCount/CycleApp';
// import { enableFreeze } from 'react-native-screens';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

function ReceivingNavigator() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Receiving" component={Users} />
        <Stack.Screen name="POReceipt" component={Users} />
        <Stack.Screen name="Orders" component={Users} />
      </Stack.Navigator>
    </>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ backgroundColor: '#f4f4f4', padding: 20 }}>
        <Image
          source={require('./assets/icon.png')} // Add your profile picture source here
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <Text style={{ marginTop: 10, fontSize: 16, fontWeight: 'bold' }}>
          Satendra Kumar R
        </Text>
      </View>

      <CustomDrawer {...props} />
    </DrawerContentScrollView>
  );
}

const DrawerRoutes = (props) => {
  // enableFreeze(true);
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: styles.drawerStyle,
        drawerActiveBackgroundColor: globalStyles.colors.success,
        drawerItemStyle: styles.drawerItemStyles,
        drawerActiveTintColor: Colors.black,
        drawerLabelStyle: styles.drawerLabelStyles,
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      {ScreensArray.map((item, index) => {
        return (
          <Drawer.Screen
            key={index}
            name={item.label}
            component={item.component}
            options={{
              item,
              drawerIcon: ({ color, size, focused }) => (
                <Icon
                  type={item.type}
                  name={item.icon}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        );
      })}
    </Drawer.Navigator>
  );
};
const AuthStack = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home">
        {(props) => (
          <LoginScreen
            {...props}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const MainStack = ({ isAuthenticated, setIsAuthenticated }) => {
  // enableFreeze(true);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homepage">
        {(props) => (
          <DrawerRoutes
            {...props}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProfileSettings">
        {(props) => (
          <ProfileSettings
            {...props}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </Stack.Screen>
      {/* <Stack.Screen name="Receiving" component={POReceipt} /> */}
      <Stack.Screen name="po_reciept" component={POReceipt} />
      <Stack.Screen name="inventory_transfer" component={InventoryTransfer} />
      <Stack.Screen name="cycle_count_period" component={CycleCountPeriod} />
      <Stack.Screen name="inventory_count" component={InventoryCount} />
      <Stack.Screen name="inventory_cycle_schedule" component={CycleSchedule} />
      <Stack.Screen name="select_inventory_cycle" component={SelectCycle} />
      <Stack.Screen name="cycle_details" component={CycleApp} />
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
    let url = await AsyncStorage.getItem('url');
    if (csrf !== null && url != null) {
      setupClient(csrf, url);
      dispatch(login({ csrf, url }));
      await AsyncStorage.multiSet([
        ['csrf', csrf],
        ['url', url],
      ]);
      setIsAuthenticated(true);
    }
    await SplashScreen.hideAsync();
  };

  useEffect(() => {
    Init();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated === false ? (
        <AuthStack
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      ) : (
        <MainStack
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
    </NavigationContainer>
  );
};

const Component = () => {
  const { visible, message } = useSelector((state) => state.snackbar);
  const dispatch = useDispatch();
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideSnackbar());
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [visible]);
  return (
    <>
      <RootNavigation />
      <Snackbar
        visible={visible}
        onDismiss={() => dispatch(hideSnackbar)} // Update this line
        duration={Snackbar.DURATION_SHORT}
      >
        {message}
      </Snackbar>
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <PaperProvider>
      <Component />
    </PaperProvider>
  </Provider>
);

// AppRegistry.registerComponent('WarehouseApp', () => App);
export default App;
// export ANDROID_SDK_ROOT=/home/satendra/Android/Sdk

export const constant = {
  SPACING: 16,
  borderRadius: 10,
  titleFontSize: 24,
  textFontSize: 16,
  subTextFontSize: 14,
};

const styles = StyleSheet.create({
  drawerStyle: {
    width: 240,
  },
  drawerItemStyles: {
    borderRadius: constant.borderRadius,
  },
  drawerLabelStyles: {
    fontSize: constant.textFontSize,
    marginHorizontal: -constant.SPACING,
  },
});
