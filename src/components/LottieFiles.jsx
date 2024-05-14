import React, { useRef, forwardRef } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

const AnimatedLottieView = forwardRef(({ source, style }, ref) => {
  return <LottieView autoPlay ref={ref} style={style} source={source} />;
});

const ReusableAnimation = forwardRef(
  ({ animationSource, style }, forwardedRef) => {
    const animation = useRef(null);

    const restartAnimation = () => {
      animation.current?.reset();
      animation.current?.play();
    };

    return (
      <View style={styles.animationContainer}>
        <AnimatedLottieView
          ref={forwardedRef ? forwardedRef : animation}
          style={[{ width: 200, height: 200, backgroundColor: '#eee' }, style]}
          source={animationSource}
        />
      </View>
    );
  }
);

export default ReusableAnimation;

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});
