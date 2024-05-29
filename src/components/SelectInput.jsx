import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SelectInput = ({ label, value, options, onChange, isLoading }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  const handleOptionPress = (option) => {
    onChange(option);
    setModalVisible(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = options.filter((option) =>
      option.value.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const renderOptions = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    } else if (filteredOptions.length === 0) {
      return <Text>No options available</Text>;
    }
    return filteredOptions.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={styles.option}
        onPress={() => handleOptionPress(option.value)}
      >
        <Text>{option.value}</Text>
      </TouchableOpacity>
    ));
  };

  // Update filteredOptions when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.input}>{value}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#000"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              onChangeText={handleSearch}
              value={searchText}
            />
            <ScrollView>{renderOptions()}</ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: -10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: 400, // Set a max height to limit the modal size
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SelectInput;
