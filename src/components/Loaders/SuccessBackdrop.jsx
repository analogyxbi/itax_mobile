import React, { useRef, useEffect } from 'react';
import { View, Modal, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import SuccessAnimation from '../../../assets/Lottie/success.json';
import { useSelector } from 'react-redux';

const SuccessBackdrop = ({ visible, onDismiss }) => {
  const animationRef = useRef(null);
  const message = useSelector((state) => state.toast.message);
  useEffect(() => {
    if (visible) {
      animationRef.current?.play();
    }
  }, [visible]);

  const handleAnimationFinish = () => {
    if (visible) {
      // Automatically dismiss the backdrop when animation finishes
      onDismiss();
    }
  };

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.container}>
        <LottieView
          ref={animationRef}
          style={styles.animation}
          source={SuccessAnimation}
          autoPlay
          loop={false}
          onAnimationFinish={handleAnimationFinish}
        />
        <Text style={styles.message}> {message} </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  animation: {
    width: 300,
    height: 300,
  },
  message: {
    marginTop: 50, // Adjust as needed
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    bottom: 1,
  },
});

export default SuccessBackdrop;
