import * as React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';

const PopUpDialog = ({
  visible,
  setVisible,
  title,
  message,
  handleCancel,
  handleOk,
  loading=false
}) => {
  const hideDialog = () => setVisible(false);

  return (
    <View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            {loading ?  <ActivityIndicator /> :<Text variant="bodyMedium"> {message} </Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancel}>Cancel</Button>
            <Button onPress={handleOk}>Ok</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default PopUpDialog;
