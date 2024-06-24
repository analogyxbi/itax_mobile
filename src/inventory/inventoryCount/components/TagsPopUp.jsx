import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

const TagsPopUp = ({
  visible,
  setVisible,
  title,
  message,
  handleCancel,
  handleOk,
}) => {
  const [tag, setTag] = React.useState(`10`);
  const hideDialog = () => setVisible(false);
  return (
    <View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium"> {message} </Text>
            <TextInput
              style={styles.inputNoIcon}
              placeholder="Counted Qty (Manual Input)"
              value={tag}
              onChangeText={setTag}
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancel}>Cancel</Button>
            <Button onPress={() => handleOk(parseInt(tag))}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default TagsPopUp;

const styles = StyleSheet.create({
  inputNoIcon: {
    width: 300,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
});
