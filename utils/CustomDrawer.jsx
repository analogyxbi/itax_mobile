import { DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { constant, drawerMenu } from '../src/constants/constants';
import Colors from './Colors';
import Icon from '../src/components/Icons';
import { Container } from '../src/components/Container';
import { Row } from '../src/components/Row';
import Styles from '../src/common/Styles';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomDrawer = (props) => {
  const navigation = useNavigation();
  const [menuIndex, setMenuIndex] = useState(-1);
  const userData = useSelector((state) => state.auth.user_data);
  return (
    <Container>
      <View
        style={{
          backgroundColor: '#f4f4f4',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* <Image
          source={require('../assets/icon.png')} // Add your profile picture source here
          style={{ width: 80, height: 80, borderRadius: 40 }}
        /> */}
        <Image
          width={'100%'}
          style={{ width: 80, height: 80, borderRadius: 40 }}
          source={
            userData?.user?.profile_pic
              ? { uri: `data:image/jpg;base64,${userData?.user?.profile_pic}` }
              : require('../assets/profile_dummy.webp')
          }
        />
        <Text style={{ marginTop: 10, fontSize: 16, fontWeight: 'bold' }}>
          {userData?.user?.firstName
            ? userData?.user?.firstName + ' ' + userData?.user?.lastName
            : 'User'}
        </Text>
      </View>
      {/* DrawerList */}
      <DrawerItemList {...props} />
      <View style={styles.spacer} />
      {/* Menu */}
      {drawerMenu.map((item, index) => {
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.menu,
              // { backgroundColor: item.bg + '99' }
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.create(200, 'easeInEaseOut', 'opacity')
              );
              // Toggle the submenu visibility
              setMenuIndex((prevIndex) => (prevIndex === index ? -1 : index));
            }}
          >
            <Row style={styles.item}>
              <Icon type={item.type} name={item.icon} size={22} />
              <Text
                style={[
                  styles.text,
                  {
                    color: menuIndex === index ? Colors.black : Colors.gray,
                    flexGrow: 1,
                  },
                ]}
              >
                {item.title}
              </Text>
              {menuIndex === index ? (
                <Feather
                  style={styles.arrowIcon}
                  name="chevron-up"
                  size={24}
                  color="black"
                />
              ) : (
                <Feather
                  stylele={styles.arrowIcon}
                  name="chevron-down"
                  size={24}
                  color="black"
                />
              )}
            </Row>
            {/* Render submenu if the menu is expanded */}
            {menuIndex === index && (
              <View
                style={{
                  borderRadius: constant.borderRadius,
                  // backgroundColor: item.bg
                }}
              >
                {item.menuList.map((subMenu, i) => (
                  <TouchableNativeFeedback
                    key={i}
                    onPress={() => navigation.navigate(subMenu.screen)} // Use navigation.navigate with the screen name
                  >
                    <View style={styles.subMenu}>
                      <Text>{subMenu.title}</Text>
                    </View>
                  </TouchableNativeFeedback>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </Container>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  textContainer: {
    paddingHorizontal: constant.SPACING,
  },
  avatar: {
    width: 50,
    height: 50,
  },
  header: {
    padding: constant.SPACING,
    ...Styles.rowView,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  name: {
    fontSize: constant.titleFontSize,
  },
  menu: {
    marginHorizontal: constant.SPACING / 1.7,
    marginVertical: constant.SPACING / 2.5,
    borderRadius: constant.borderRadius,
  },
  item: {
    paddingHorizontal: constant.SPACING / 1.5,
    paddingVertical: constant.SPACING / 1.2,
  },
  text: {
    fontSize: constant.textFontSize,
    paddingHorizontal: constant.SPACING,
  },
  subMenu: {
    paddingHorizontal: constant.SPACING,
    paddingVertical: constant.SPACING / 1.5,
  },
  spacer: {
    marginVertical: constant.SPACING,
    width: '90%',
    height: 1,
    backgroundColor: Colors.light,
    alignSelf: 'center',
  },
  arrowIcon: { position: 'absolute', right: 10 },
});
