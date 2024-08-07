import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SelectInput = ({
  label,
  value,
  options,
  onChange,
  isLoading,
  handleRefresh,
  placeholder, // New prop for placeholder text
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  // Handle option press to update the selected option
  const handleOptionPress = (option) => {
    onChange(option);
    setModalVisible(false);
  };

  // Handle search input change to filter options
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = options.filter((option) =>
      option.value.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  // Render options with a checkmark for the selected one
  const renderOptions = () => {
    if (filteredOptions?.length === 0) {
      return <Text>No options available</Text>;
    }
    return filteredOptions?.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[styles.option, option.value === value && styles.selectedOption]}
        onPress={() => handleOptionPress(option.value)}
      >
        <Text style={styles.optionText}>{option.value}</Text>
        {option.value === value && (
          <Ionicons name="checkmark" size={20} color="#007BFF" />
        )}
      </TouchableOpacity>
    ));
  };

  // Update filteredOptions when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.input, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
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
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
    marginVertical: 10,
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
  placeholder: {
    color: '#aaa', // Placeholder text color
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
    maxHeight: 400,
    position: 'relative', // Ensure the close button is positioned relative to this container
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 25,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#f0f8ff', // Background color for selected option
  },
});

export default SelectInput;
