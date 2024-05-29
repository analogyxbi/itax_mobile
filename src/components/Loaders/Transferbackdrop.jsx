import React, { useRef } from 'react';
import { View, Modal, StyleSheet, Text, Button } from 'react-native';
import ReusableAnimation from '../LottieFiles';
import Transfer from '../../../assets/Lottie/transfer.json';
import { TouchableOpacity } from 'react-native-web';
import { useSelector } from 'react-redux';

const Transferbackdrop = ({ loading, setLoading }) => {
  const animationRef = useRef(null);
  const message = useSelector((state) => state.toast.message);
  const restartAnimation = () => {
    animationRef.current?.restartAnimation();
  };
  return (
    <Modal transparent={true} animationType="none" visible={loading}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ReusableAnimation
            ref={animationRef}
            animationSource={Transfer}
            style={{ width: 300, height: 300, backgroundColor: '#ffffff' }}
          />
        </View>
        <Text style={styles.message}> {message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Adjusted width to cover the entire screen
    maxWidth: 200, // Optional: Set a maximum width for the loader
  },
  buttonContainer: {
    paddingTop: 20,
  },
  message: {
    marginTop: 120, // Adjust as needed
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    bottom: 1,
  },
});

export default Transferbackdrop;
