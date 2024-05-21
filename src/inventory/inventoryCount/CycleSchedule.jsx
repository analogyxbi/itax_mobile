import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../../style/globalStyles";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import { Button } from "react-native-paper";

const CycleSchedule = () => {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="chevron-back-outline"
                        size={24}
                        color={globalStyles.colors.darkGrey}
                    />
                </Pressable>
                <Text style={styles.heading}>Create Cycle Schedule</Text>
            </View>
            <View style={{ padding: 30 }}>
                <View>
                    <Text style={styles.inputLabel}>Warehouse</Text>
                    <RNPickerSelect
                        // selectedValue={formData.current_whse}
                        onValueChange={(itemValue) => {
                            // onSelectBins('current_whse', itemValue);
                            // formData.current_bin = '';
                            // setBins((prev) => ({ ...prev, from: [] }));
                            // if (!binsData[itemValue]) {
                            //     getBins('from', itemValue);
                            // }
                        }}
                        items={[]}
                    />
                </View>
                <View>
                    <Text style={styles.inputLabel}>Cycle Period</Text>
                    <RNPickerSelect
                        // selectedValue={formData.current_whse}
                        onValueChange={(itemValue) => {
                            // onSelectBins('current_whse', itemValue);
                            // formData.current_bin = '';
                            // setBins((prev) => ({ ...prev, from: [] }));
                            // if (!binsData[itemValue]) {
                            //     getBins('from', itemValue);
                            // }
                        }}
                        items={[]}
                    />
                </View>
                <View>
                    <Text style={styles.inputLabel}>Year</Text>
                    <RNPickerSelect
                        // selectedValue={formData.current_whse}
                        onValueChange={(itemValue) => {
                            // onSelectBins('current_whse', itemValue);
                            // formData.current_bin = '';
                            // setBins((prev) => ({ ...prev, from: [] }));
                            // if (!binsData[itemValue]) {
                            //     getBins('from', itemValue);
                            // }
                        }}
                        items={[]}
                    />
                </View>
                <View style={globalStyles.dFlexR}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Period Start</Text>
                        <RNPickerSelect
                            // selectedValue={formData.current_whse}
                            onValueChange={(itemValue) => {
                                // onSelectBins('current_whse', itemValue);
                                // formData.current_bin = '';
                                // setBins((prev) => ({ ...prev, from: [] }));
                                // if (!binsData[itemValue]) {
                                //     getBins('from', itemValue);
                                // }
                            }}
                            items={[]}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Period End</Text>
                        <RNPickerSelect
                            // selectedValue={formData.current_whse}
                            onValueChange={(itemValue) => {
                                // onSelectBins('current_whse', itemValue);
                                // formData.current_bin = '';
                                // setBins((prev) => ({ ...prev, from: [] }));
                                // if (!binsData[itemValue]) {
                                //     getBins('from', itemValue);
                                // }
                            }}
                            items={[]}
                        />
                    </View>
                </View>
                <View>
                    <Text style={styles.inputLabel}>Calendar</Text>
                    <RNPickerSelect
                        // selectedValue={formData.current_whse}
                        onValueChange={(itemValue) => {
                            // onSelectBins('current_whse', itemValue);
                            // formData.current_bin = '';
                            // setBins((prev) => ({ ...prev, from: [] }));
                            // if (!binsData[itemValue]) {
                            //     getBins('from', itemValue);
                            // }
                        }}
                        items={[]}
                    />
                </View>
                <View>
                    <Text style={styles.inputLabel}>Period End</Text>
                    <RNPickerSelect
                        // selectedValue={formData.current_whse}
                        onValueChange={(itemValue) => {
                            // onSelectBins('current_whse', itemValue);
                            // formData.current_bin = '';
                            // setBins((prev) => ({ ...prev, from: [] }));
                            // if (!binsData[itemValue]) {
                            //     getBins('from', itemValue);
                            // }
                        }}
                        items={[]}
                    />
                </View>
                <View
                    style={[
                        globalStyles.dFlexR,
                        globalStyles.justifySE,
                        { padding: 5 },
                    ]}
                >
                    <Button
                        buttonColor={globalStyles.colors.success}
                        icon="share"
                        mode="contained"
                    // onPress={initiateTransfer}
                    >
                        Create
                    </Button>
                </View>
            </View>
        </View>
    )
}

export default CycleSchedule;

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    header: {
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: globalStyles.colors.darkGrey,
        marginLeft: 20,
    },
});
