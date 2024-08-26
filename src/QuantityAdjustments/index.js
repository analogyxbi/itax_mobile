import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Text, View, ScrollView, StyleSheet, Linking, SafeAreaView, Dimensions } from 'react-native';
import { globalStyles } from '../style/globalStyles';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import SelectInput from '../components/SelectInput';
import { fetchOnePartDetailsApi, fetchPartDetailsApi, fetchReasons } from './utils';
import { showSnackbar } from '../Snackbar/messageSlice';
import SelectInputValue from '../components/SelectInputValue';
import { setOnSuccess } from '../components/Loaders/toastReducers';
import { AnalogyxBIClient } from '@analogyxbi/connection';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const QuantityAdjustments = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [partNum, setPartNum] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [binwithPart, setBinwithpart] = useState([]);
    const [formData, setFormData] = useState({});
    const [partDetails, setPartdetails] = useState();
    const [partSpecification, setPartSpecification] = useState();
    const [selectedBin, setSelectedBin] = useState({});
    const [reasons, setReasons] = useState([]);

    const onChangeDate = (event) => {
        setShowPicker(false); 
        const pickedDate = new Date(event?.nativeEvent?.timestamp)
        setDate(pickedDate);
    };
    console.log(date)

    const fetchPartDetails = async () => {
        setFormData({});
        setPartdetails({});
        setSelectedBin({});
        setBinwithpart([]);
        setPartSpecification({});
        try {
            setLoading(true);
            const partDetailResponse = await fetchPartDetailsApi(partNum);
            console.log("partDetailResponse", partDetailResponse);
            setPartdetails(partDetailResponse);
            const partData = await fetchOnePartDetailsApi(partNum);
            console.log("partData", partData)
            setPartSpecification(partData.data?.value[0])
        } catch (error) {
            dispatch(showSnackbar("Error fetching part details"))
        } finally {
            setLoading(false);
        }
    }
    const handleSelectWarehouse = (itemValue) => {
        const binlist = partDetails?.data?.returnObj?.PartOnHandBin?.filter(bin => bin.WarehouseCode == itemValue);
        console.log(binlist)
        setBinwithpart(binlist);
        setFormData(prev => ({ ...prev, WareHouseCode: itemValue }));
    }

    const handleSelectReason = (val) => {
        setFormData(prev => ({
            ...prev,
            reasonValue: val?.value,
            reasonCode: val?.ReasonCode,
            reasonType: val?.ReasonType
        }));
    }

    const onSelectBin = (val) => {
        setFormData(prev => ({ ...prev, ...val }));
        setSelectedBin(val)
    }

    const handleChange = (val, name) => {
        setFormData(prev => ({ ...prev, [name]: val }));
    }

    const handleAdjust = async() => {
        if (formData?.QuantityOnHand) {
            const postdata = {
                ds: {
                  InventoryQtyAdj: [
                    {
                      Company: formData?.Company,
                      PartNum: formData?.PartNum,
                      WareHseCode: formData?.WareHouseCode,
                      OnHandQty: formData?.OnHandQty,
                      BinNum: formData?.BinNum,
                      AdjustQuantity: formData?.QuantityAdjust,
                      ReasonCode: formData?.reasonCode,
                      UnitOfMeasure: formData?.DimCode,
                      TransDate: date,
                      ReasonType: formData?.reasonType,
                      OnHandUOM: formData?.DimCode,
                      ReasonCodeDescription: formData?.reasonValue,
                      RowMod: "U"
                    }
                  ]
                }
              }
            console.log(postPayload);
            const epicor_endpoint = `/Erp.BO.InventoryQtyAdjSvc/SetInventoryQtyAdj`;

            const postPayload = {
                epicor_endpoint,
                request_type: 'GET',
                data: JSON.stringify(postdata)
            };
            try {
                const response = await AnalogyxBIClient.post({
                    endpoint: `/erp_woodland/resolve_api`,
                    postPayload,
                    stringify: false,
                });
                console.log("response", response);
                dispatch(setOnSuccess({ value: true, message: 'Quantity Adjusted' }))
        
            } catch (err) {
                console.error(`Error fetching Reasons:`, err);
                throw err; // Rethrow the error to handle it at the call site if needed
            }
        } else {
            dispatch(showSnackbar("Enter the Qty first"));
            return;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const reasons = await fetchReasons();
                console.log("reaons", reasons)
                const typeMFilters = reasons?.data?.value?.filter(da => da?.ReasonType == "M")
                setReasons(typeMFilters);
            } catch (error) {
                dispatch(showSnackbar("Error fetching reason codes"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="chevron-back-outline"
                        size={24}
                        color={globalStyles.colors.darkGrey}
                    />
                </Pressable>
                <Text style={styles.heading}>Quantity Adjustments</Text>
            </View >
            <ScrollView style={styles.body}>
                <Text style={{ fontSize: 18, paddingHorizontal: 13, fontWeight: "600" }}>Selection</Text>
                <View style={globalStyles.dFlexR}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        onChangeText={(val) => setPartNum(val)}
                        value={partNum}
                        // editable={!loading}
                        placeholder="Part Num"
                    />
                    <Pressable onPress={fetchPartDetails}>
                        {!loading ? (
                            <Feather
                                name="search"
                                size={24}
                                color={globalStyles.colors.darkGrey}
                            />
                        ) : (
                            <ActivityIndicator
                                animating={true}
                                color={MD2Colors.red800}
                            />
                        )}
                    </Pressable>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            openScanner();
                        }}
                    >
                        <Text style={styles.closeButtonText}>
                            <AntDesign
                                name="scan1"
                                size={24}
                                color={globalStyles.colors.darkGrey}
                            />
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.datepicker, globalStyles.dFlexR, globalStyles.justifySB]} onPress={() => setShowPicker(true)}>
                    <Text>{date ? date?.toISOString() : "Select Date"}</Text>
                </TouchableOpacity>
                {showPicker && (
                    <RNDateTimePicker
                        value={date}
                        onChange={onChangeDate}
                        mode="date"
                    />)}

                <View style={{ flex: 1, paddingHorizontal: 12, }}>
                    <SelectInput
                        containerStyle={{
                            marginTop: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderColor: '#ccc',
                            borderRadius: 5,
                        }}
                        value={formData.WareHouseCode || null}
                        onChange={(itemValue) => {
                            handleSelectWarehouse(itemValue);
                        }}
                        options={partDetails?.data?.returnObj?.PartOnHandWhse?.map((data) => ({
                            ...data,
                            label: data.WarehouseCode,
                            value: data.WarehouseCode,
                        }))}
                        placeholder="Warehouse"
                        isLoading={loading}
                        label="WarehouseCode"
                    // handleRefresh={handleOptionsRefresh}
                    />
                </View>
                {partSpecification?.PartDescription ? <Text style={{ paddingHorizontal: 13, marginTop: 10, color: globalStyles?.colors.darkGrey }}>Description: {partSpecification?.PartDescription}</Text> : null}
                <View
                    style={{
                        margin: 12,
                        borderColor: globalStyles.colors.success,
                        borderWidth: 1,
                    }}
                >
                    {
                        binwithPart?.length > 0 &&
                        <View
                            style={[
                                globalStyles.dFlexR,
                                globalStyles.justifySB,
                                styles.poModalHeader,
                            ]}
                        >
                            <Text style={{ color: 'white' }}>BinNum</Text>
                            <Text style={{ color: 'white' }}>OnHand Qty</Text>
                            <Text style={{ color: 'white' }}>
                                Bin Description
                            </Text>
                        </View>
                    }
                    <ScrollView style={{ maxHeight: 200, padding: 5 }}>
                        {binwithPart?.length > 0 ? (
                            binwithPart?.map((bin, id) => (
                                <View
                                    key={id}
                                    style={{
                                        padding: 2,
                                        backgroundColor:
                                            bin.BinNum == selectedBin?.BinNum
                                                ? '#d9d9d9'
                                                : 'white',
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => onSelectBin(bin)}
                                    >
                                        <View
                                            style={[
                                                globalStyles.dFlexR,
                                                globalStyles.justifySB,
                                            ]}
                                        >
                                            <Text>{bin.BinNum}</Text>
                                            <Text>{bin.QuantityOnHand} {selectedBin?.UnitOfMeasure}</Text>
                                            <Text>{bin?.BinDescription}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', marginVertical: 10 }}>
                                No Data Found
                            </Text>
                        )}
                    </ScrollView>
                </View>
                <Text style={{ fontSize: 18, paddingHorizontal: 13, fontWeight: "600" }}>Adjustment</Text>
                <View style={{ marginTop: 10 }}>
                    <View>
                        <Text style={{ paddingHorizontal: 13, color: globalStyles?.colors.darkGrey }}>Bin</Text>
                        <TextInput
                            style={[styles.input, { flex: 1, marginVertical: 5 }]}
                            // onChangeText={(val) => setPartNum(val)}
                            value={selectedBin?.BinNum}
                            editable={false}
                            placeholder="Bin"
                        />
                    </View>
                    <View>
                        <Text style={{ paddingHorizontal: 13, color: globalStyles?.colors.darkGrey }}>Quantity ({selectedBin?.UnitOfMeasure})</Text>
                        <TextInput
                            style={[styles.input, { flex: 1, marginVertical: 5 }]}
                            onChangeText={(val) => handleChange(val, "QuantityAdjust")}
                            value={formData?.QuantityAdjust?.toString() || formData?.QuantityOnHand?.toString()}
                            keyboardType='numeric'
                            placeholder="Quantity"
                        />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12, }}>
                    <Text style={{  color: globalStyles?.colors.darkGrey }}>Reason</Text>
                        <SelectInputValue
                            value={formData?.reasonValue || null}
                            onChange={(itemValue) => {
                                handleSelectReason(itemValue);
                            }}
                            options={reasons?.map((data) => ({
                                ...data,
                                label: data.Description,
                                value: data.Description,
                            }))}
                            placeholder="Reason"
                            isLoading={loading}
                            label="Reason"
                        // handleRefresh={handleOptionsRefresh}
                        />
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity
                // disabled={_.isEmpty(form) || _.isEmpty(POData)}
                style={styles.receiveButton}
                onPress={handleAdjust}
            >
                <Text style={styles.receiveButtonText}>Adjust</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    header: {
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        color: globalStyles.colors.darkGrey,
        marginLeft: 20,
    },
    body: {
        padding: 10,
        height: '80%',
    },
    input: {
        height: 32,
        margin: 12,
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        borderColor: globalStyles.colors.grey,
        borderWidth: 1,
    },
    closeButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    datepicker: {
        padding: 5,
        marginHorizontal: 12,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: globalStyles.colors.grey,

    },
    poModalHeader: {
        padding: 5,
        backgroundColor: globalStyles.colors.success,
    },
    receiveButton: {
        backgroundColor: globalStyles.colors.success,
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
        position: 'absolute',
        bottom: 20,
        marginTop: 20,
        width: '94%',
        zIndex: 10,
    },
    receiveButtonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default QuantityAdjustments;
