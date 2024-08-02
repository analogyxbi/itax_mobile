import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const AttachedImage = ({ imageBase64, onRemove, key, handleImagePress }) => {
  const containerWidth = 100; // Initial width for one image
  const containerMargin = 5; // Initial margin
  const totalMargin = containerMargin * 2; // Margin on both sides

  // Calculate container width based on the number of images
  const screenWidth = Dimensions.get('window').width;
  const numberOfImagesPerRow = Math.floor(
    screenWidth / (containerWidth + totalMargin)
  );
  const calculatedWidth =
    (screenWidth - totalMargin) / numberOfImagesPerRow - containerMargin;

  return (
    <View
      style={[styles.container, { width: calculatedWidth }]}
      key={key}
      onPress={handleImagePress}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
        style={styles.image}
      />

      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 10, // Increased margin to create space for the remove button
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover', // or 'contain' for different image resizing modes
    borderRadius: 10,
    margin: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5, // Adjust this value to properly position the remove button
    right: 5, // Adjust this value to properly position the remove button
    backgroundColor: 'rgba(1, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AttachedImage;
