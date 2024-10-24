import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import ErrorAnimation from '../../../assets/Lottie/error.json';

const ErrorBackdrop = ({ visible, onDismiss }) => {
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
          source={ErrorAnimation}
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

export default React.memo(ErrorBackdrop);
