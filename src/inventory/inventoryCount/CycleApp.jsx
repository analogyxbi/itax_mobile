import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import InitialScreen from './InitialScreen';
import CountingScreen from './CountingScreen';
import { useSelector } from 'react-redux';

export default function CycleApp() {
  const [screen, setScreen] = useState('initial'); // Initial screen state
  const { currentCycle } = useSelector((state) => state.inventory);
  const [part, setPart] = useState('');
  const [bin, setBin] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.container}>
      {screen === 'initial' ? (
        <InitialScreen setScreen={setScreen} currentCycle={currentCycle} />
      ) : (
        <CountingScreen
          part={part}
          setPart={setPart}
          bin={bin}
          setBin={setBin}
          countedQty={countedQty}
          setCountedQty={setCountedQty}
          notes={notes}
          setNotes={setNotes}
          setScreen={setScreen}
          currentCycle={currentCycle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
