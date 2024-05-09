import React, { useState } from 'react';
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { globalStyles } from '../../style/globalStyles';
import { Switch } from 'react-native-paper';

const roleOptions = [
  {
    label: 'Public',
    value: 'Public',
  },
  {
    label: 'Admin',
    value: 'Admin',
  },
  {
    label: 'Power User',
    value: 'Power User',
  },
  {
    label: 'Viewer',
    value: 'Viewer',
  },
];
const windowHeight = Dimensions.get('window').height;

const UsersForm = ({
  initialFormData,
  formData,
  setFormData,
  userGroups,
  timeZone,
  usersData,
  roleData,
}) => {
  const [error, setError] = useState({});
  const validatePassword = (value, name) => {
    setError((prev) => {
      const stateObj = { ...prev, [name]: '' };

      switch (name) {
        case 'username':
          if (!value) {
            stateObj[name] = 'Please enter Username.';
          } else if (
            usersData.find((data) => data.username === value) != undefined
          ) {
            stateObj[name] = 'Username Already Taken......';
          }
          break;

        case 'password':
          if (!value) {
            stateObj[name] = 'Please enter Password.';
          } else if (
            formData.confirm_password &&
            value !== formData.confirmPassword
          ) {
            stateObj['confirm_password'] =
              'Password and Confirm Password does not match.';
          } else {
            stateObj['confirm_password'] = formData.confirm_password
              ? ''
              : error.confirm_password;
          }
          break;

        case 'confirm_password':
          if (!value) {
            stateObj[name] = 'Please enter Confirm Password.';
          } else if (formData.password && value !== formData.password) {
            stateObj[name] = 'Password and Confirm Password does not match.';
          }
          break;

        case 'email':
          if (!value) {
            stateObj[name] = 'Please enter Email.';
          } else if (
            usersData.find(
              (data) => data.email === value && data.id != formData?.id
            ) != undefined
          ) {
            stateObj[name] = 'Email Already exist......';
          }
          break;

        default:
          break;
      }

      return stateObj;
    });
  };
  const onChangeText = (e, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e,
    }));
    validatePassword(e, name);
  };
  const renderLabelsValues = (values) => {
    const result = values.map((val) => ({
      ...val,
      label: val.name,
      value: val.id,
    }));
    return result;
  };
  return (
    <SafeAreaView>
      <ScrollView style={{ maxHeight: '92%' }}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'first_name')}
          value={formData?.first_name}
          placeholder="First name"
          // autoCapitalize
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'last_name')}
          value={formData?.last_name}
          placeholder="Last name"
          // autoCapitalize
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'username')}
          value={formData?.username}
          placeholder="Username"
        />
        {error.username && (
          <Text style={{ color: 'red' }} className="err">
            {error.username}
          </Text>
        )}
        <View style={[globalStyles.dFlexR, { paddingLeft: 13 }]}>
          <Text>Active: </Text>
          <Switch
            value={formData?.active}
            onValueChange={(text) => setFormData({ active: text })}
          />
        </View>
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'phone')}
          value={formData?.phone}
          placeholder="Phone"
          inputMode="tel"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'email')}
          value={formData?.email}
          inputMode="email"
          placeholder="Email"
        />
        {error.email && (
          <Text style={{ color: 'red' }} className="err">
            {error.email}
          </Text>
        )}
        <View style={[styles.input, styles.select]}>
          <RNPickerSelect
            onValueChange={(text) => onChangeText(text, 'roles')}
            items={renderLabelsValues(roleData)}
            placeholder={{
              label: 'Role',
              value: null,
            }}
            value={formData?.roles}
          />
        </View>
        <View style={[styles.input, styles.select]}>
          <RNPickerSelect
            onValueChange={(text) => onChangeText(text, 'time_zone')}
            placeholder={{
              label: 'Time Zone',
              value: null,
            }}
            items={renderLabelsValues(timeZone)}
            value={formData?.time_zone}
          />
        </View>
        <View style={[styles.input, styles.select]}>
          <RNPickerSelect
            onValueChange={(text) => onChangeText(text, 'user_group')}
            placeholder={{
              label: 'User Group',
              value: null,
            }}
            items={renderLabelsValues(userGroups)}
            value={formData?.user_group}
          />
        </View>
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'password')}
          value={formData?.password}
          secureTextEntry={true}
          placeholder="Password"
        />
        {error.password && (
          <Text style={{ color: 'red' }} className="err">
            {error.password}
          </Text>
        )}
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChangeText(text, 'confirm_password')}
          value={formData?.confirm_password}
          secureTextEntry={true}
          placeholder="Confirm Password"
        />
        {error.confirm_password && (
          <Text style={{ color: 'red' }} className="err">
            {error.confirm_password}
          </Text>
        )}
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

export default UsersForm;
