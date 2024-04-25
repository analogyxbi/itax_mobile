import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../../style/globalStyles";


const HomepageIcon = ({ icon, bgcolor, name }) => {
    return (
        <View style={{ width: "21%", margin:5 }}>
            <TouchableOpacity style={[styles.IconContainer, { backgroundColor: bgcolor }]} onPress={() => { }}>
                {icon}
                <Text style={styles.iconName}>{name}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    IconContainer: {
        width: "100%",
        height: 120,
        // backgroundColor: "FF7474",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
    },
    iconName: {
        maxWidth: 60,
        textAlign: "center",
        marginHorizontal: 5,
        color:globalStyles.colors.darkGrey,
        // fontWeight: "600",
        fontSize:10,
    }
});

export default HomepageIcon;