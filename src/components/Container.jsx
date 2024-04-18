import { View, ViewStyle } from "react-native";
import { styles } from "./styles";


export const Container = ({
  children,
  backgroundColor,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>{children}</View>
  )
};