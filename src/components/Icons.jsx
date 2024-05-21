import React from 'react';
// import {AntDesign} from '@expo/AntDesign';
// import FontAwesome from '@expo/FontAwesome';
// import FontAwesome5 from '@expo/FontAwesome5';
// import Ionicons from '@expo/Ionicons';
// import Feather from '@expo/Feather';
// import MaterialCommunityIcons from '@expo/MaterialCommunityIcons';
// import Entypo from '@expo/Entypo';
// import MaterialIcons from '@expo/MaterialIcons';
// import SimpleLineIcons from '@expo/SimpleLineIcons';
// import Octicons from '@expo/Octicons';
// import Foundation from '@expo/Foundation';
// import EvilIcons from '@expo/EvilIcons';
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
} from '@expo/vector-icons';
export const Icons = {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Feather,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Entypo,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
};

const Icon = ({ type, name, color, size, style }) => {
  const Tag = type;
  if (type) {
    return <Tag name={name} size={size} color={color} style={style} />;
  }
  return null;
};

export default Icon;
