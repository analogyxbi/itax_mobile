import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../style/globalStyles";
import { Button } from "react-native-paper";


const InventoryTransfer = () => {
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
                <Text style={styles.heading}>Inventory Transfer</Text>
            </View>
            <View style={styles.container}>
                <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Current Warehouse</Text>
                        <TextInput
                            style={styles.input}
                            // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                            // value={formData?.confirm_password}
                            placeholder="Current Warehouse"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Current Bin</Text>
                        <TextInput
                            style={styles.input}
                            // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                            // value={formData?.confirm_password}
                            placeholder="Current Bin"
                        />
                    </View>
                </View>
                <View>
                    <Text style={styles.inputLabel}>Select Product</Text>
                    <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        // value={formData?.confirm_password}
                        placeholder="Select Product"
                    />
                </View>
                <Text style={{ margin: 10, color: globalStyles.colors.darkGrey }}>Stock: ## </Text>
                <View>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        // value={formData?.confirm_password}
                        placeholder="Enter Quantity here"
                    />
                </View>
                <View>
                    <Text style={styles.inputLabel}>Select Warehouse</Text>
                    <TextInput
                        style={styles.input}
                        // onChangeText={(text) => onChangeText(text, 'confirm_password')}
                        // value={formData?.confirm_password}
                        placeholder="Select End Warehouse"
                    />
                </View>
            </View>
            <TouchableOpacity
                style={styles.receiveButton}
                onPress={() => { }}
            >
                <Text style={styles.receiveButtonText}>Transfer</Text>
            </TouchableOpacity>
        </View>
    )
}

export default InventoryTransfer;

const styles = StyleSheet.create({
    container: {
        padding: 10
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
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        borderColor: globalStyles.colors.grey,
        borderWidth: 1,
    },
    inputLabel: {
        color: globalStyles.colors.darkGrey,
        fontWeight: '500',
        paddingLeft: 10,
        fontSize: 15,
    },
    receiveButton: {
        backgroundColor: globalStyles.colors.success,
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: 10,
        marginLeft:"5%",
        width: '90%',
    },
    receiveButtonText: {
        color: 'white',
        textAlign: 'center',
    },
})