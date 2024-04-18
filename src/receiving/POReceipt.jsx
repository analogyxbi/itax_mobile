import { Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Checkbox, SegmentedButtons } from 'react-native-paper';
import { globalStyles } from '../style/globalStyles';

const POReceipt = () => {
    const navigation = useNavigation();
    const [tabValue, setTabvalue] = React.useState('1');

    const handleTabs = (val) => {
        setTabvalue(val)
    }

    return (
        <SafeAreaView style={styles.container}>
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
                        { value: '1', label: 'Entry', icon: () => <FontAwesome name="search" size={24} color={globalStyles.colors.darkGrey} /> },
                        { value: '2', label: 'Receipt', icon: () => <FontAwesome5 name="receipt" size={24} color={globalStyles.colors.darkGrey} /> },
                        { value: '3', label: 'Line', icon: () => <Feather name="list" size={24} color={globalStyles.colors.darkGrey} /> },
                    ]}
                />
                {
                    tabValue == "1" && (
                        <View style={styles.tabView}>
                            <Text style={styles.inputLabel}>PO Num</Text>
                            <View style={[styles.input, styles.select]}>
                                <RNPickerSelect
                                    // onValueChange={(text) => onChangeText(text, 'time_zone')}
                                    placeholder={{
                                        label: 'PO Num',
                                        value: null,
                                    }}
                                    items={[]}
                                // value={formData?.time_zone}
                                />
                            </View>
                            <Text style={styles.inputLabel}>Packslip</Text>
                            <View style={[styles.input, styles.select]}>
                                <RNPickerSelect
                                    // onValueChange={(text) => onChangeText(text, 'time_zone')}
                                    placeholder={{
                                        label: 'Packslip',
                                        value: null,
                                    }}
                                    items={[]}
                                // value={formData?.time_zone}
                                />
                            </View>
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
                            <Text style={styles.inputLabel}>Filter</Text>
                            <TextInput
                                style={styles.input}
                                // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                                // value={formData?.confirm_password}
                                // secureTextEntry={true}
                                placeholder="Filter"
                            />
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
    }
});

export default POReceipt;