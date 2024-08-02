import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../../style/globalStyles";
import { useNavigation } from "@react-navigation/native";


const HomepageIcon = ({ icon, bgcolor, name, onPress }) => {
    const navigation = useNavigation();
    return (
        <View style={{ width: "47%", margin: 5 }}>
            <TouchableOpacity onPress={onPress} style={[styles.IconContainer, { backgroundColor: bgcolor }]}>
                {icon}
                <Text style={styles.iconName}>{name}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    IconContainer: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        alignItems: "center",
        padding: 10,
    },
    iconName: {
        maxWidth: 60,
        textAlign: "center",
        color: globalStyles.colors.darkGrey,
        // fontWeight: "600",
        fontSize: 12,
    }
});

export default HomepageIcon;