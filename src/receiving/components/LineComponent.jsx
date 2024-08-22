import { AnalogyxBIClient } from "@analogyxbi/connection";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Button, RadioButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading, setOnError, setOnSuccess } from "../../components/Loaders/toastReducers";
import SelectInput from "../../components/SelectInput";
import { setWarehouses, setWhseBins } from "../../inventory/reducer/inventory";
import { showSnackbar } from "../../Snackbar/messageSlice";
import { globalStyles } from "../../style/globalStyles";
import { getBinsData } from "../../utils/utils";
import SelectAsync from "../../components/SelectAsync";
import { convertQuantity } from "../../../utils/uomconversion";

const LineComponent = ({ currentLine, styles, formData, setFormdata, onChangeText, isNewPackSlip, handleSave, isSaved, setIsSaved, warehouse }) => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const { warehouses, binsData } = useSelector((state) => state.inventory);
    const [bins, setBins] = useState({
        from: [],
        to: [],
    });
    const [supplierQty, setSupplierQty] = useState('');
    const [ourQty, setOurQty] = useState('');

    const handleSupplierQtyChange = (text) => {
        setFormdata(prev => ({ ...prev, input: text }));
        const parsedQty = parseFloat(text) || 0;
        setSupplierQty(text);
        const convertedQty = convertUOMs(parsedQty, currentLine?.PUM, currentLine?.IUM);
        setOurQty(convertedQty.toString());
    };

    const handleOurQtyChange = (text) => {
        setFormdata(prev => ({ ...prev, input: text }));
        const parsedQty = parseFloat(text) || 0;
        setOurQty(text);
        const convertedQty = convertUOMs(parsedQty, currentLine?.IUM, currentLine?.PUM);
        setSupplierQty(convertedQty.toString());
    };

    function getWarehouse() {
        setRefreshing(true);

        const postPayload = {
            epicor_endpoint:
                '/Erp.BO.WarehseSvc/Warehses?$select=WarehouseCode,Name,Description',
            request_type: 'GET',
        };
        try {
            AnalogyxBIClient.post({
                endpoint: `/erp_woodland/resolve_api`,
                postPayload,
                stringify: false,
            })
                .then(({ json }) => {
                    dispatch(setWarehouses(json.data.value));
                    setRefreshing(false);
                    dispatch(showSnackbar('Warehouse List refreshed'));
                })
                .catch((err) => {
                    // setLoading(false);
                    setRefreshing(false);
                    dispatch(
                        showSnackbar(
                            'Error getting the list of warehouses',
                            JSON.stringify(err)
                        )
                    );
                });
        } catch (err) {
            dispatch(
                showSnackbar(
                    'Error getting the list of warehouses',
                    JSON.stringify(err)
                )
            );
        }
    }

    useEffect(() => {
        if (warehouses.length == 0) {
            getWarehouse();
        }
    }, []);

    function handleValidate() {
        if (!formData.BinNum || !formData?.input) {
            return true;
        }
        return false;
    }
    useEffect(() => {
        if (formData.WareHouseCode && !binsData[formData.WareHouseCode]) {
            getBins('from', formData.WareHouseCode);
        }
    }, []);
    function getBins(to, warehouse) {
        setRefreshing(true);
        const filter = encodeURI(`WarehouseCode eq '${warehouse}'`);
        const epicor_endpoint = `/Erp.BO.WhseBinSvc/WhseBins?$select=WarehouseCode,BinNum&$filter=${filter}&$top=10000`;
        const postPayload = {
            epicor_endpoint,
            request_type: 'GET',
        };

        try {
            AnalogyxBIClient.post({
                endpoint: `/erp_woodland/resolve_api`,
                postPayload,
                stringify: false,
            })
                .then(({ json }) => {
                    setBins((prev) => ({ ...prev, [to]: json.data.value }));
                    dispatch(showSnackbar(`Bins fetched for ${warehouse}`));
                    dispatch(setWhseBins({ warehouse, bins: json.data.value }));
                    setRefreshing(false);
                })
                .catch((err) => {
                    // setLoading(false);
                    setRefreshing(false);
                    dispatch(
                        showSnackbar(
                            'Error getting the list of warehouses',
                            JSON.stringify(err)
                        )
                    );
                    setRefreshing(false);
                });
        } catch (err) {
            dispatch(
                showSnackbar(
                    'Error getting the list of warehouses',
                    JSON.stringify(err)
                )
            );
        }
    }

    const generateQRCodeAndPrintPDF = async (currentLine, formData) => {
        dispatch(setIsLoading({ value: true, message: 'Printing...' }));
        const epicor_endpoint = `/BaqSvc/WHAppPrint2(WOOD01)/?POLine=${currentLine?.POLine}&PONum=${currentLine?.PONum}`;
        const postData = {
            UD12_Character01: "Analogyx1",
            UD12_Key1: `${currentLine?.PONum}`,
            UD12_Key2: `${currentLine?.POLine}`,
            UD12_Key3: "",
            UD12_Key4: "",
            UD12_Key5: "",
            RowMod: "A"
        }
        AnalogyxBIClient.post({
            endpoint: `/erp_woodland/resolve_api`,
            postPayload: {
                epicor_endpoint,
                request_type: 'PATCH',
                data: JSON.stringify(postData),
            },
            stringify: false,
        }).then(({ json }) => {
            dispatch(setOnSuccess({ value: true, message: 'Print Job created.' }));
        }).catch(err => {
            dispatch(setIsLoading({ value: false, message: '' }));
            dispatch(setOnError({ value: true, message: 'Error Occured While Printing \n', err }));
        })
    };

    function onSelectBins(key, value) {
        setFormdata((prev) => ({ ...prev, [key]: value }));
    }

    function createNewReceipt() {
        setFormdata((prev) => ({ ...prev, BinNum: '', input: '' }));
        setIsSaved(false);
    }

    useEffect(() => {
        setFormdata(prev => ({ ...prev, qty_type: currentLine?.QtyOption == "Our" ? "Our" : "Supplier" }));
    }, [currentLine])

    const convertUOMs = (qty, from, to) => {
        const ourQty = convertQuantity(qty, from, to);
        return ourQty;
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
                </View>
            </View>
            <View style={[globalStyles.dFlexR, globalStyles.justifySE]}>
                <View style={[globalStyles.dFlexR]}>
                    <RadioButton
                        value="Supplier"
                        disabled={isNewPackSlip && currentLine?.QtyOption == "Our"}
                        status={formData?.qty_type === 'Supplier' ? 'checked' : 'unchecked'}
                        onPress={() => setFormdata(prev => ({ ...prev, qty_type: 'Supplier' }))}
                    />
                    <Text style={styles.inputLabel}>Supplier Qty ({currentLine?.PUM})</Text>
                </View>
                <View style={[globalStyles.dFlexR]}>
                    <RadioButton
                        value="Our"
                        disabled={isNewPackSlip && currentLine?.QtyOption == "Supplier"}
                        status={formData?.qty_type === 'Our' ? 'checked' : 'unchecked'}
                        onPress={() => setFormdata(prev => ({ ...prev, qty_type: 'Our' }))}
                    />
                    <Text style={styles.inputLabel}>Our Qty ({currentLine?.IUM})</Text>
                </View>
            </View>
            <View style={[globalStyles.dFlexR, globalStyles.justifySB]}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        editable={formData?.qty_type !== 'Our'}
                        keyboardType='numeric'
                        style={styles.input}
                        onChangeText={handleSupplierQtyChange}
                        value={supplierQty}
                        placeholder="Supplier Qty"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        editable={formData?.qty_type !== 'Supplier'}
                        keyboardType='numeric'
                        style={styles.input}
                        onChangeText={handleOurQtyChange}
                        value={ourQty}
                        placeholder="Our Qty"
                    />
                </View>
            </View>
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
                <View style={[globalStyles.dFlexR, globalStyles.justifySB, { paddingHorizontal: 10 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Warehouse</Text>
                        <SelectInput
                            value={formData.WareHouseCode || null}
                            onChange={(itemValue) => {
                                onSelectBins('WareHouseCode', itemValue);
                                setFormdata(prev => ({...prev, BinNum: ''}));
                            }}
                            options={warehouses?.map((data) => ({
                                ...data,
                                label: data.WarehouseCode,
                                value: data.WarehouseCode,
                            }))}
                            isLoading={refreshing}
                            label="WarehouseCode"
                        // handleRefresh={handleOptionsRefresh}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Bin Number</Text>
                        <SelectAsync
                            value={formData.BinNum}
                            onChange={(itemValue) => {
                                onSelectBins('BinNum', itemValue);
                            }}
                            options={
                                binsData[formData?.WareHouseCode]?.map((data) => ({
                                    ...data,
                                    label: data.BinNum,
                                    value: data.BinNum,
                                })) || []
                            }
                            isLoading={refreshing}
                            // handleRefresh={handleOptionsRefresh}
                            label="BinNum"
                            fetchOptions={getBinsData}
                            warehouse={warehouse}
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
                {isSaved ?
                    <Button
                        buttonColor={globalStyles.colors.success}
                        icon="plus"
                        mode="contained"
                        // disabled={handleValidate()}
                        onPress={createNewReceipt}
                    >
                        New Receipt
                    </Button> :
                    <Button
                        buttonColor={ globalStyles.colors.success }
                        icon="floppy"
                        mode="contained"
                        disabled={handleValidate()}
                        onPress={() => handleSave(true)}
                    >
                        Save
                    </Button>}

                {
                    isNewPackSlip &&
                    <Button
                        buttonColor={globalStyles.colors.success}
                        icon="printer"
                        mode="contained"
                        disabled={!isSaved}
                        onPress={() => {
                            generateQRCodeAndPrintPDF(currentLine, formData)
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
