import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
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
  placeholder,
  containerStyle
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

  // Render each option item
  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.option, item.value === value && styles.selectedOption]}
      onPress={() => handleOptionPress(item.value)}
    >
      <Text style={styles.optionText}>{item.value}</Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color="#007BFF" />
      )}
    </TouchableOpacity>
  );

  // Update filteredOptions when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const OptionItem = React.memo(({ item, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.option, isSelected && styles.selectedOption]}
      onPress={() => onPress(item.value)}
    >
      <Text style={styles.optionText}>{item.value}</Text>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color="#007BFF" />
      )}
    </TouchableOpacity>
  ));

  return (
    <View style={containerStyle ? containerStyle : styles.container}>
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
            <FlatList
              data={filteredOptions}
              renderItem={({ item }) => (
                <OptionItem
                  item={item}
                  isSelected={item.value === value}
                  onPress={handleOptionPress}
                />
              )}
              keyExtractor={(item) => item.value}
              ListEmptyComponent={<Text>No options available</Text>}
            />
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
    color: '#aaa',
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
    position: 'relative',
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
    backgroundColor: '#f0f8ff',
  },
});

export default SelectInput;
