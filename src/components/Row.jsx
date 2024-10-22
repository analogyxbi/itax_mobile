import { View } from "react-native";
import { styles } from "./styles";

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