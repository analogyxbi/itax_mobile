import React, { useState } from 'react';
import { Button, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { globalStyles } from '../../style/globalStyles';
import { Switch } from 'react-native-paper';

const windowHeight = Dimensions.get('window').height;

const ApiConfigform = ({ initialFormData, formData, setFormData}) => {
   
    const onChangeText = (e, name) => {
        setFormData(prev => ({
            ...prev, [name]: e
        }))
    }

    return (
        <SafeAreaView>
            <ScrollView style={{ maxHeight: "92%" }}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'dp_url')}
                    value={formData?.dp_url}
                    placeholder="Data Pipeline URL"
                // autoCapitalize
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'auth_user')}
                    value={formData?.auth_user}
                    placeholder="Data Pipeline User"
                // autoCapitalize
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'auth_password')}
                    value={formData?.auth_password}
                    secureTextEntry={true}
                    placeholder="password"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'S3_ACCESS_KEY_ID')}
                    value={formData?.S3_ACCESS_KEY_ID}
                    placeholder="S3 Access Key Id"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'S3_SECRET_ACCESS_KEY')}
                    value={formData?.S3_SECRET_ACCESS_KEY}
                    placeholder="S3 Access Secret"
                />
                 <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'S3_REGION')}
                    value={formData?.S3_REGION}
                    placeholder="S3 Region"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'S3_BUCKET')}
                    value={formData?.S3_BUCKET}
                    placeholder="S3 Bucket"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'JDBC_CONNECTION_STRING')}
                    value={formData?.JDBC_CONNECTION_STRING}
                    placeholder="DW Connection String"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'JDBC_USERNAME')}
                    value={formData?.JDBC_USERNAME}
                    placeholder="DW Username"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'JDBC_PASSWORD')}
                    value={formData?.JDBC_PASSWORD}
                    secureTextEntry={true}
                    placeholder="DW Password"
                />
                
            </ScrollView>
            <TouchableOpacity style={styles.resetButton} onPress={() => setFormData(initialFormData)}>
                <Text style={styles.resetButtonText} >Reset</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        borderColor: globalStyles.colors.grey,
        borderWidth: 1,
    },
    select: {
        padding: 0,
    },
    resetButton: {
        alignItems: "center",
        display: "flex"
    },
    resetButtonText: {
        fontSize: 23,
        color: globalStyles.colors.primary
    }
});

export default ApiConfigform;