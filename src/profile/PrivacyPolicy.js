import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View, ScrollView, StyleSheet, Linking, SafeAreaView, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PrivacyPolicy = () => {
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
                    <Text style={styles.headerText}>Privacy Policy</Text>
                </View>
            </View>
            <ScrollView style={{padding: 15}}>
                <Text style={styles.paragraph}>
                    This privacy policy applies to the Woodland app (hereby referred to as "Application") for mobile devices that was created by Analogyx (hereby referred to as "Service Provider") as a Free service. This service is intended for use "AS IS".
                </Text>

                <Text style={styles.heading}>Information Collection and Use</Text>
                <Text style={styles.paragraph}>
                    The Application collects information when you download and use it. This information may include information such as:
                </Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>- Your device's Internet Protocol address (e.g. IP address)</Text>
                    <Text style={styles.listItem}>- The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</Text>
                    <Text style={styles.listItem}>- The time spent on the Application</Text>
                    <Text style={styles.listItem}>- The operating system you use on your mobile device</Text>
                </View>

                <Text style={styles.paragraph}>
                    The Application does not gather precise information about the location of your mobile device.
                </Text>

                <Text style={styles.paragraph}>
                    The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices, and marketing promotions.
                </Text>

                <Text style={styles.paragraph}>
                    For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to https://analogyx.com/. The information that the Service Provider request will be retained by them and used as described in this privacy policy.
                </Text>

                <Text style={styles.heading}>Third Party Access</Text>
                <Text style={styles.paragraph}>
                    Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
                </Text>
                <Text style={styles.paragraph}>
                    Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
                </Text>
                <View style={styles.list}>
                    <Text style={styles.listItem} onPress={() => Linking.openURL('https://www.google.com/policies/privacy/')}>
                        - Google Play Services
                    </Text>
                </View>

                <Text style={styles.paragraph}>
                    The Service Provider may disclose User Provided and Automatically Collected Information:
                </Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>- as required by law, such as to comply with a subpoena, or similar legal process;</Text>
                    <Text style={styles.listItem}>- when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</Text>
                    <Text style={styles.listItem}>- with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</Text>
                </View>

                <Text style={styles.heading}>Opt-Out Rights</Text>
                <Text style={styles.paragraph}>
                    You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
                </Text>

                <Text style={styles.heading}>Data Retention Policy</Text>
                <Text style={styles.paragraph}>
                    The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at https://analogyx.com/ and they will respond in a reasonable time.
                </Text>

                <Text style={styles.heading}>Children</Text>
                <Text style={styles.paragraph}>
                    The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                </Text>
                <Text style={styles.paragraph}>
                    The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (https://analogyx.com/) so that they will be able to take the necessary actions.
                </Text>

                <Text style={styles.heading}>Security</Text>
                <Text style={styles.paragraph}>
                    The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                </Text>

                <Text style={styles.heading}>Changes</Text>
                <Text style={styles.paragraph}>
                    This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                </Text>
                <Text style={styles.paragraph}>This privacy policy is effective as of 2024-07-29</Text>

                <Text style={styles.heading}>Your Consent</Text>
                <Text style={styles.paragraph}>
                    By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                </Text>

                <Text style={styles.heading}>Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at https://analogyx.com/.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    paragraph: {
        fontSize: 14,
        marginVertical: 8,
        lineHeight: 20,
    },
    list: {
        marginVertical: 8,
    },
    listItem: {
        fontSize: 14,
        marginVertical: 4,
        lineHeight: 20,
    },
    link: {
        color: 'blue',
    },
});

export default PrivacyPolicy;
