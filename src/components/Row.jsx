import { View, ViewStyle } from "react-native";
import { styles } from "./styles";
import { ReactNode } from "react";



export const Row = ({
  children,
  backgroundColor,
  style,
}) => {
  return (
    <View style={[styles.row, { backgroundColor }, style]}>
      {children}
    </View>
  )
};