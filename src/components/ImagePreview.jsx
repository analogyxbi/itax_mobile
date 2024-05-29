import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from 'react-native';

const ImagePreview = ({ imageBase64, onClose }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
            style={styles.previewImage}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexDirection: 'row',
    margin: 10,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'red',
    paddingHorizontal: 15, // Adjusted horizontal padding
    paddingVertical: 10, // Adjusted vertical padding
    borderRadius: 20, // Adjusted border radius
  },
  previewImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginTop: 20,
  },
});

export default ImagePreview;
