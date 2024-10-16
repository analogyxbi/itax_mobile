import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { globalStyles } from '../../style/globalStyles';
import RNPickerSelect from 'react-native-picker-select';
import { View } from 'react-native';

const windowHeight = Dimensions.get('window').height;

const ApiConfigform = ({
  initialFormData,
  formData,
  setFormData,
  saveFormData,
  companies,
  company
}) => {
  const onChangeText = (e, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e,
    }));
  };
  const renderLabelsValues = () => {
    const result = companies?.map((val) => ({
      ...val,
      label: val.Company1,
      value: val.Company1,
    }));
    return result;
  };

  return (
    <SafeAreaView>
      <ScrollView style={{ maxHeight: '92%' }}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'base_url')}
          value={formData?.base_url}
          placeholder="Base URL"
          // autoCapitalize
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'api_username')}
          value={formData?.api_username}
          placeholder="Username"
          // autoCapitalize
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'api_password')}
          value={formData?.api_password}
          secureTextEntry={true}
          placeholder="password"
        />
        <RNPickerSelect
          onValueChange={(text) => onChangeText(text, 'api_company')}
          items={renderLabelsValues()}
          placeholder={{
            label: 'Company',
            value: null,
          }}
          value={formData?.api_company}
        />
      </ScrollView>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => setFormData(initialFormData)}
      >
        <Text style={styles.resetButtonText}>Reset</Text>
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
    alignItems: 'center',
    display: 'flex',
  },
  resetButtonText: {
    fontSize: 23,
    color: globalStyles.colors.primary,
  },
});

export default ApiConfigform;
