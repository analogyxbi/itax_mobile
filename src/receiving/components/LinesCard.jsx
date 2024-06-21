import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../style/globalStyles';

const LinesCard = ({ data, onSelectLine, isPackLine }) => {
  return (
    <TouchableOpacity onPress={() => onSelectLine(data)}>
      <View style={styles.card}>
        <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
          <Text style={styles.lineText}>PO Line: {data?.POLine || 'N/A'}</Text>
          {
            isPackLine
              ? <Text style={styles.text}>
                Packline: {data?.PackLine || 'N/A'}
              </Text>
              : <Text style={styles.text}>
                Rel: {data?.PORelNum || 'N/A'}, Part: {data?.POLinePartNum || 'N/A'}
              </Text>
          }
        </View>
        <Text style={styles.description}>{data?.POLineLineDesc}</Text>
        {
          isPackLine
            ? <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
              <Text style={styles.description}>Order Qty: {data?.OrderQty ? parseInt(data?.OrderQty) : "N/A"}</Text>
              <Text style={styles.description}>Received Qty: {data?.ReceivedQty ? parseInt(data?.ReceivedQty) : "N/A"}</Text>
              <Text style={styles.description}>Invoiced: {data?.Invoiced ? "yes" : "no"}</Text>
            </View>
            : <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
              <Text style={styles.description}>Xrel Qty: {data?.XRelQty ? parseInt(data?.XRelQty) : "N/A"}</Text>
              <Text style={styles.description}>Arrived Qty: {data?.ArrivedQty ? parseInt(data?.ArrivedQty) : "N/A"}</Text>
            </View>
        }
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
    fontSize: 13,
  },
  description: {
    fontSize: 12,
    color: globalStyles.colors.darkGrey
  }
});

export default LinesCard;
