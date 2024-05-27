import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AttachedImage = ({ imageBase64, onRemove, key }) => {
  console.log({ key });
  return (
    <View style={styles.container} key={key}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover', // or 'contain' for different image resizing modes
    borderRadius: 10,
    margin: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
