import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../style/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import packageJson from "../../package.json"

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const HelpScreen = () => {
    const navigation = useNavigation();
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    onPress={() => navigation.goBack()}
                    name="chevron-back"
                    size={24}
                    color="#4287F5"
                // style={{ position: 'absolute', marginLeft: 10, zIndex: 1 }}
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

                {/* <Text style={styles.sectionTitle}>Getting Started</Text>
            <Text style={styles.text}>
                1. Download the app from the App Store or Google Play.
                2. Create an account or log in if you already have one.
                3. Set up your warehouse details and start adding inventory.
            </Text> */}

                {/* <Text style={styles.sectionTitle}>Frequently Asked Questions (FAQ)</Text>
            <Text style={styles.text}>
                <Text style={styles.question}>Q: How do I add new inventory?</Text>
                <Text>A: Go to the Inventory section, click on "Add New Item", and fill in the required details.</Text>

                <Text style={styles.question}>Q: How do I track shipments?</Text>
                <Text>A: Navigate to the Shipments section, where you can see the status of all incoming and outgoing shipments.</Text>

                <Text style={styles.question}>Q: How do I reset my password?</Text>
                <Text>A: Go to the login page, click on "Forgot Password", and follow the instructions.</Text>
            </Text> */}

                <Text style={styles.sectionTitle}>Contact Support</Text>
                <Text style={styles.text}>
                    {"           "} If you need further assistance, please contact us at
                    <TouchableOpacity onPress={() => Linking.openURL('https://analogyx.com/contact-us/#')}>
                        <Text style={styles.link}> https://analogyx.com/contact-us/#</Text>
                    </TouchableOpacity>.
                </Text>
                <Text style={styles.text}>
                    USA: +1 415 226 4641{"\n"}
                    INDIA: +91 843 155 0963
                </Text>
            </View>
            <Text style={{ alignSelf: "center", marginTop: 300 }}>Version: {packageJson.version} </Text>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    content: {
        // backgroundColor: '#f1f1f1',
        margin: 10,
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
        fontSize: 16,
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