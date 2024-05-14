import React, { useRef, useEffect } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import ErrorAnimation from '../../../assets/Lottie/error.json';

const ErrorBackdrop = ({ visible, onDismiss }) => {
  const animationRef = useRef(null);

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
});

export default ErrorBackdrop;
