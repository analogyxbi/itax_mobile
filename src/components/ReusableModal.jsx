import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ReusableModal = ({
  visible,
  title,
  keys,
  mandatoryKeys,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Function to handle input changes
  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: '',
      }));
    }
  };

  // Function to validate form inputs
  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // Check for mandatory keys
    mandatoryKeys.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = 'Field is required';
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({}); // Clear form data after submission
    }
  };

  // Function to handle modal close
  const handleClose = () => {
    setFormData({}); // Clear form data on close
    setErrors({}); // Clear errors on close
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {keys.map((key) => (
            <View key={key}>
              <TextInput
                style={styles.input}
                placeholder={key}
                value={formData[key] || ''}
                onChangeText={(text) => handleInputChange(key, text)}
              />
              {errors[key] && (
                <Text style={styles.errorText}>{errors[key]}</Text>
              )}
            </View>
          ))}
          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Close" onPress={handleClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'stretch', // Ensures inputs stretch to full width
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
});

export default ReusableModal;
