import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Dimensions, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import packageJson from "../../app.json";
import { globalStyles } from "../style/globalStyles";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const HelpScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    onPress={() => navigation.goBack()}
                    name="chevron-back"
                    size={24}
                    color="#4287F5"
                style={{ position: 'absolute', marginLeft: 10, zIndex: 1 }}
                />
                <View style={{ alignItems: 'center', width: windowWidth }}>
                    <Text style={styles.headerText}>Help</Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Introduction</Text>
                <Text style={styles.text}>
                    {"           "} Welcome to our Warehouse Management App!. This app helps you manage inventory, track shipments, and streamline warehouse operations.
                </Text>

                <Text style={styles.sectionTitle}>Contact Support</Text>
                <Text style={styles.text}>
                    {"           "} If you need further assistance, please contact us at
                    <TouchableOpacity onPress={() => Linking.openURL('https://analogyx.com/contact-us')}>
                        <Text style={styles.link}> https://analogyx.com/contact-us/#</Text>
                    </TouchableOpacity>.
                </Text>
                <Text style={styles.text}>
                    USA: +1 415 226 4641{"\n"}
                    INDIA: +91 843 155 0963
                </Text>
            </View>
            <Text style={{ alignSelf: "center", marginTop: 300 }}>Version: {packageJson.version} </Text>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    content: {
        // backgroundColor: '#f1f1f1',
        // margin: 10,
        padding: 15,
        borderRadius: 8,
        minHeight: 150,
    },
    header: {
        backgroundColor: 'white',
        shadowOffset: { height: 3, width: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        height: windowHeight * 0.06,
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        paddingLeft: 10,
    },

    headerText: {
        fontWeight: 'bold',
        fontSize: 18,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    text: {
        fontSize: 16,
        marginTop: 8,
        color: globalStyles.colors.darkGrey,
    },
    question: {
        fontWeight: 'bold',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default HelpScreen;