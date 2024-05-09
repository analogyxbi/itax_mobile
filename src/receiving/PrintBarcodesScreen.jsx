import { Barcode } from "expo-barcode-generator"
import { StyleSheet, View } from "react-native"
import { Modal, Portal } from "react-native-paper"
import { ScrollView } from "react-native-web"
import { globalStyles } from "../style/globalStyles"


const PrintBarcodeScreen = ({ openBarcodescreen, setOpenBarcodeScreen }) => {
    return (
        <Portal>
            <Modal visible={openBarcodescreen} onDismiss={() => setOpenBarcodeScreen(false)} contentContainerStyle={styles.poModalContainer}>
                <View>
                    <View>
                        <Barcode
                            value="123456789999"
                            options={{ format: 'UPC', width: 2, height: 50, fontSize: 10 }}
                        />
                    </View>
                    {/* <View style={globalStyles.dFlexR}> */}
                    <View>
                        <Barcode
                            value="123456789999"
                            options={{ format: 'UPC', width: 2, height: 50, fontSize: 10 }}
                        />
                    </View>
                    <View>
                        <Barcode
                            value="123456789999"
                            options={{ format: 'UPC', width: 2, height: 50, fontSize: 10 }}
                        />
                    </View>
                    {/* </View> */}
                    <View>
                        <Barcode
                            value="123456789999"
                            options={{ format: 'UPC', width: 2, height: 50, fontSize: 10 }}
                        />
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default PrintBarcodeScreen;

const styles = StyleSheet.create({
    poModalContainer: {
        backgroundColor: 'white',
        padding: 10,
        margin: 10,
        height: "80%",
        overflow: "scroll"
    },
    BarcodeContainer: {

    }
});