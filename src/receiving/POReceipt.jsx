import { AntDesign, Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Checkbox, SegmentedButtons } from 'react-native-paper';
import { globalStyles } from '../style/globalStyles';
import { BarCodeScanner } from 'expo-barcode-scanner';

const POReceipt = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const navigation = useNavigation();
    const [tabValue, setTabvalue] = useState('1');
    const [scanned, setScanned] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);

    const handleTabs = (val) => {
        setTabvalue(val)
    }
    const openScanner = () => {
        setScannerVisible(true);
        setScanned(false);
    };

    const closeScanner = () => {
        setScannerVisible(false);
    };


    // if (hasPermission === null) {
    //     return <Text>Requesting for camera permission</Text>;
    // }
    // if (hasPermission === false) {
    //     return <Text>No access to camera</Text>;
    // }
    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);
    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        if (data.startsWith('http')) {
            Alert.alert(
                'Open URL',
                `Do you want to open this URL?\n${data}`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => setScanned(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Open',
                        onPress: () => {
                            setScanned(false);
                            Linking.openURL(data);
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            {scannerVisible ? (
                <View style={{ flex: 1 }}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.bottomButtonsContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setScanned(false)}>
                            <Text style={styles.closeButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
                            <Text style={styles.closeButtonText}>Close Scanner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) :
                <View>
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back-outline" size={24} color={globalStyles.colors.darkGrey} />
                        </Pressable>
                        <Text style={styles.heading}>PO Receipts</Text>
                    </View>
                    <View style={styles.body}>
                        <SegmentedButtons
                            value={tabValue}
                            onValueChange={handleTabs}
                            buttons={[
                                { value: '1', label: 'Entry', icon: () => <Ionicons name="search" size={24} color={globalStyles.colors.darkGrey} /> },
                                { value: '2', label: 'Receipt', icon: () => <FontAwesome5 name="receipt" size={24} color={globalStyles.colors.darkGrey} /> },
                                { value: '3', label: 'Line', icon: () => <Feather name="list" size={24} color={globalStyles.colors.darkGrey} /> },
                            ]}
                        />
                        {
                            tabValue == "1" && (
                                <View style={styles.tabView}>
                                    <Text style={styles.inputLabel}>PO Num</Text>
                                    <View style={globalStyles.dFlexR}>
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                            // value={formData?.confirm_password}
                                            // secureTextEntry={true}
                                            placeholder="PO Num"
                                        />
                                        <TouchableOpacity style={styles.closeButton} onPress={openScanner}>
                                            <Text style={styles.closeButtonText}>
                                                <AntDesign name="scan1" size={24} color="black" /></Text>
                                        </TouchableOpacity>
                                        <Pressable
                                            onPress={() => { }}>
                                            <Ionicons name="search" size={24} color={globalStyles.colors.darkGrey} />
                                        </Pressable>
                                    </View>
                                    <Text style={styles.inputLabel}>Packslip</Text>
                                    <TextInput
                                        style={styles.input}
                                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                        // value={formData?.confirm_password}
                                        // secureTextEntry={true}
                                        placeholder="Packslip"
                                    />
                                    <Text style={styles.inputLabel}>Supplier Name</Text>
                                    <Text style={{ color: globalStyles.colors.darkGrey, margin: 10 }}>ABC Metals</Text>
                                    <TouchableOpacity style={styles.receiveButton} onPress={() => { }}>
                                        <Text style={styles.receiveButtonText}>Receive</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        {
                            tabValue == "2" && (
                                <View style={styles.tabView}>
                                    <View>
                                        <Text style={styles.inputLabel}>Filter</Text>
                                        <TextInput
                                            style={styles.input}
                                            // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                            // value={formData?.confirm_password}
                                            // secureTextEntry={true}
                                            placeholder="Filter"
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.inputLabel, { color: "black" }]}>ACD-PUR01</Text>
                                        <Text style={{ paddingLeft: 10 }}>Purchased 01</Text>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB, { fontSize: 13 }]}>
                                            <Text style={{ paddingLeft: 10, fontSize: 13 }}>4252/1/1</Text>
                                            <Text style={{ paddingHorizontal: 10, fontSize: 13, }}>10/EA</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        }
                        {
                            tabValue == "3" && (
                                <View style={styles.tabView}>
                                    <ScrollView style={{ flex: 1, maxHeight: "90%" }}>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                            <View>
                                                <Text style={styles.inputLabel}>PO</Text>
                                                <Text style={{ padding: 10 }}>4252</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.inputLabel}>Line</Text>
                                                <Text style={{ padding: 10 }}>1</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.inputLabel}>Rel</Text>
                                                <Text style={{ padding: 10 }}>1</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.sideHeading}>Quantities</Text>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Order</Text>
                                                <Text style={{ padding: 10 }}>10/EA</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Arrived</Text>
                                                <Text style={{ padding: 10 }}>0/EA</Text>
                                            </View>
                                        </View>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Input</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                                    // value={formData?.confirm_password}
                                                    // secureTextEntry={true}
                                                    placeholder="Input"
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>IUM</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                                    // value={formData?.confirm_password}
                                                    // secureTextEntry={true}
                                                    placeholder="IUM"
                                                />
                                            </View>
                                        </View>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySE]}>
                                            <View>
                                                <Text style={styles.inputLabel}>Complete</Text>
                                                <Checkbox status={true ? 'checked' : 'unchecked'} />
                                            </View>
                                            <View>
                                                <Text style={styles.inputLabel}>Insp Req</Text>
                                                <Checkbox status={true ? 'checked' : 'unchecked'} />
                                            </View>
                                            <View>
                                                <Text style={styles.inputLabel}>Print Label</Text>
                                                <Checkbox status={true ? 'checked' : 'unchecked'} />
                                            </View>
                                        </View>
                                        <Text style={styles.sideHeading}>Location</Text>
                                        <View >
                                            <Text style={styles.inputLabel}>PCID</Text>
                                            <TextInput
                                                style={styles.input}
                                                // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                                // value={formData?.confirm_password}
                                                // secureTextEntry={true}
                                                placeholder="PCID"
                                            />
                                        </View>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Warehouse Code</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                                    // value={formData?.confirm_password}
                                                    // secureTextEntry={true}
                                                    placeholder="Warehouse Code"
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Bin Number</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                                    // value={formData?.confirm_password}
                                                    // secureTextEntry={true}
                                                    placeholder="Bin Number"
                                                />
                                            </View>
                                        </View>
                                        <View style={[globalStyles.dFlexR, globalStyles.justifySB, { padding: 5 }]}>
                                            <Button buttonColor={globalStyles.colors.primary} icon="receipt" mode="contained" onPress={() => console.log('Pressed')}>
                                                PO
                                            </Button>
                                            <Button buttonColor={globalStyles.colors.primary} icon="file" mode="contained" onPress={() => console.log('Pressed')}>
                                                REC
                                            </Button>
                                            <Button buttonColor={globalStyles.colors.primary} icon="printer" mode="contained" onPress={() => console.log('Pressed')}>
                                                Print Tags
                                            </Button>
                                        </View>
                                    </ScrollView>
                                    <TouchableOpacity style={styles.receiveButton} onPress={() => { }}>
                                        <Text style={styles.receiveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </View>
                </View>
            }

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
    },
    header: {
        padding: 15,
        display: "flex",
        flexDirection: "row",
        // justifyContent: 'space-between',
        alignItems: "center",
    },
    heading: {
        fontSize: 24,
        fontWeight: "700",
        color: globalStyles.colors.darkGrey,
        marginLeft: 20
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 'auto',
      },
    body: {
        padding: 10,
        height: "92%"
    },
    tabView: {
        marginTop: 10,
        flex: 1
    },
    sideHeading: { fontWeight: "600", fontSize: 18, padding: 10 },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        borderColor: globalStyles.colors.grey,
        borderWidth: 1,
    },
    select: {
        padding: 0,
    },
    inputLabel: {
        color: globalStyles.colors.darkGrey,
        fontWeight: "500",
        paddingLeft: 10,
        fontSize: 15
    },
    receiveButton: {
        backgroundColor: globalStyles.colors.primary,
        padding: 10,
        borderRadius: 5,
        position: "absolute",
        bottom: 10,
        width: "100%",
    },
    receiveButtonText: {
        color: "white",
        textAlign: "center"
    },
    closeButton: {
        // backgroundColor: '#B628F8',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        // color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default POReceipt;