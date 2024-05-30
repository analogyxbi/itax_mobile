import { ScrollView, Text, TextInput, View } from "react-native"
import { Button } from "react-native-paper";
import { generatePDF } from "../../utils/PDFGenerator";
import RNPickerSelect from 'react-native-picker-select';
import { globalStyles } from "../../style/globalStyles";


const LineComponent = ({ currentLine, styles, formData, bins, onChangeText, isNewPackSlip, handleSave }) => {

    const renderBinOptions = (values) => {
        const result = values.map((val) => ({
            ...val,
            label: val.BinNum,
            value: val.BinNum,
        }));
        return result;
    };

    function handleValidate() {
        if (!formData.BinNum || !formData?.input) {
            return true;
        }
        return false;
    }
    return (
        <ScrollView style={{ flex: 1, maxHeight: '99%' }}>
            <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                <View>
                    <Text style={styles.inputLabel}>PO</Text>
                    <Text style={{ padding: 10 }}>
                        {currentLine.PONum || 'N/A'}
                    </Text>
                </View>
                <View>
                    <Text style={styles.inputLabel}>Line</Text>
                    <Text style={{ padding: 10 }}>
                        {currentLine.POLine || 'N/A'}
                    </Text>
                </View>
                <View>
                    <Text style={styles.inputLabel}>PackLine</Text>
                    <Text style={{ padding: 10 }}>
                        {currentLine.PackLine || 'N/A'}
                    </Text>
                </View>
                <View>
                    <Text style={styles.inputLabel}>Rel</Text>
                    <Text style={{ padding: 10 }}>
                        {currentLine.PORelNum || 'N/A'}
                    </Text>
                </View>
            </View>
            <Text style={styles.sideHeading}>Quantities</Text>
            <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Order</Text>
                    {
                        isNewPackSlip ?
                            <Text style={{ padding: 10 }}>
                                {(currentLine.XRelQty &&
                                    parseInt(currentLine.XRelQty)) ||
                                    '-'}
                                /{currentLine.PUM || '-'}
                            </Text>
                            : <Text style={{ padding: 10 }}>
                                {(currentLine.OrderQty &&
                                    parseInt(currentLine.OrderQty)) ||
                                    '-'}
                                /{currentLine.PUM || '-'}
                            </Text>
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Arrived</Text>
                    {
                        isNewPackSlip ?
                            <Text style={{ padding: 10 }}>
                                {(currentLine.ArrivedQty &&
                                    parseInt(currentLine.ArrivedQty)) ||
                                    '-'}
                                /{currentLine.IUM || '-'}
                            </Text>
                            : <Text style={{ padding: 10 }}>
                                {(currentLine.ReceivedQty &&
                                    parseInt(currentLine.ReceivedQty)) ||
                                    '-'}
                                /{currentLine.IUM || '-'}
                            </Text>
                    }

                    {/* <TextInput
              style={styles.input}
              onChangeText={(text) => onChangeText(text, 'arrived_qty')}
              value={currentLine.PORelArrivedQty && Math.round(currentLine.PORelArrivedQty)?.toString()}
              placeholder="Arrived qty"
            /> */}
                </View>
            </View>
            <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Input Qty</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => onChangeText(text, 'input')}
                        value={formData.input}
                        placeholder="Input"
                    />
                </View>
            </View>
            {/* <View style={[globalStyles.dFlexR, globalStyles.justifySE]}>
          <View>
            <Text style={styles.inputLabel}>Complete</Text>
            <Checkbox status={true ? 'checked' : 'unchecked'} />
          </View>
          <View>
            <Text style={styles.inputLabel}>Insp Req</Text>
            <Checkbox status={true ? 'checked' : 'unchecked'} />
          </View>
          <View>
            <Text style={styles.inputLabel}>Print Label</Text>
            <Checkbox status={true ? 'checked' : 'unchecked'} />
          </View>
        </View> */}
            <Text style={styles.sideHeading}>Location</Text>
            <View>
                <Text style={styles.inputLabel}>Note</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => onChangeText(text, 'note')}
                    value={formData?.note || currentLine?.POLineLineDesc}
                    multiline={true}
                    placeholder="Note"
                />
            </View>
            {
                isNewPackSlip &&
                <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Warehouse Code</Text>
                        {/* <TextInput
              style={styles.input}
              onChangeText={(text) => onChangeText(text, 'WareHouseCode')}
              value={formData?.WareHouseCode || currentLine?.WareHouseCode || "-"}
              placeholder="Warehouse Code"
            /> */}
                        <Text style={{ padding: 10 }}>
                            {currentLine?.WarehouseCode}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Bin Number</Text>
                        {/* <TextInput
              style={styles.input}
              onChangeText={(text) => onChangeText(text, 'BinNum')}
              value={currentLine?.BinNum}
              placeholder="Bin Number"
            /> */}
                        <RNPickerSelect
                            onValueChange={(text) => onChangeText(text, 'BinNum')}
                            items={renderBinOptions(bins)}
                            placeholder={{
                                label: 'BinNum',
                                value: null,
                            }}
                            value={formData?.BinNum}
                        />
                    </View>
                </View>
            }
            <View
                style={[
                    globalStyles.dFlexR,
                    globalStyles.justifySE,
                    { padding: 5 },
                ]}
            >
                {
                    !isNewPackSlip &&
                    <Button
                        buttonColor={globalStyles.colors.primary}
                        mode="contained"
                        // disabled={currentLine.ArrivedQty !== currentLine.XRelQty}
                        onPress={() => handleSave(false)}
                    >
                        Reverse
                    </Button>
                }
                <Button
                    buttonColor={globalStyles.colors.success}
                    icon="floppy"
                    mode="contained"
                    disabled={handleValidate()}
                    onPress={() => handleSave(true)}
                >
                    Save
                </Button>
                {
                    isNewPackSlip &&
                    <Button
                        buttonColor={globalStyles.colors.success}
                        icon="printer"
                        mode="contained"
                        // disabled={!saved}
                        onPress={() => {
                            console.log({ currentLine, formData })
                            generatePDF(currentLine, formData)
                        }}
                    >
                        Print Tags
                    </Button>
                }
            </View>
        </ScrollView>
    )
}

export default LineComponent;
