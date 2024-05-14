import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LinesCard = ({ data, onSelectLine }) => {
  return (
    <TouchableOpacity onPress={() => onSelectLine(data)}>
      <View style={styles.card}>
        <Text style={styles.lineText}>Line: {data?.POLine || 'N/A'}</Text>
        <Text style={styles.text}>
          Rel: {data?.PORelNum || 'N/A'}, Part: {data?.POLinePartNum || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 5, // for shadow effect on Android
    shadowColor: '#000000', // for shadow effect on iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lineText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
  },
});

export default LinesCard;
