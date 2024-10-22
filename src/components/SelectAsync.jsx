import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';

const SelectAsync = ({
    label,
    value,
    onChange,
    placeholder,
    fetchOptions, // Function to fetch options from the server
    warehouse
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(-1);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch();

    // Debounced search handler
    const handleSearch = useCallback(
        debounce(async (text) => {
            if (text.trim() === '') {
                setPage(-1)
                return
            }; // Avoid unnecessary API calls for empty searches

            setLoading(true);
            setPage(-1); // Reset to first page on new search
            setHasMore(true);

            try {
                const result = await fetchOptions(text, 0, warehouse); // Fetch first page
                setOptions(result.data);
                setFilteredOptions(result.data);
                setHasMore(result.hasMore);
            } catch (error) {
                dispatch(showSnackbar('Failed to fetch options.'))
                // Alert.alert('Error', 'Failed to fetch options');
            } finally {
                setLoading(false);
            }
        }, 1000),
        [fetchOptions, warehouse]
    );

    // Handle search input change
    const onSearchChange = (text) => {
        setSearchText(text);
        if(text.length>0){
            handleSearch(text);
        }else{
            setPage(-1)
            setTimeout(()=>{
                loadMoreData()
            })
        }
    };

    const loadMoreData = async () => {
        if (!hasMore || loading) return;

        setLoading(true);

        try {
            const result = await fetchOptions(searchText, page + 1, warehouse);

            if (result.data.length === 0) {
                setHasMore(false);
            } else {
                setOptions((prevOptions) => [...prevOptions, ...result.data]);
                setFilteredOptions((prevOptions) => [...prevOptions, ...result.data]);
                setPage((prevPage) => prevPage + 1);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load more options');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalVisible) {
            setHasMore(true);
            loadMoreData();
        }
    }, [warehouse, modalVisible]);

    const handleOptionPress = (option) => {
        onChange(option);
        closeModal();
    };

    const closeModal = () => {
        setModalVisible(false);
        setOptions([]);
        setFilteredOptions([]);
        setSearchText('');
        setHasMore(true);
        setPage(-1);
    };

    const OptionItem = React.memo(({ item, onPress, isSelected }) => (
        <TouchableOpacity
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onPress(item.BinNum)}
        >
            <Text style={styles.optionText}>{item.BinNum}</Text>
            {isSelected && (
                <Ionicons name="checkmark" size={20} color="#007BFF" />
            )}
        </TouchableOpacity>
    ));

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.input, !value && styles.placeholder]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#000"
                    style={styles.dropdownIcon}
                />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeModal}
                        >
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            onChangeText={onSearchChange}
                            value={searchText}
                        />
                        {loading && page === -1 ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                data={filteredOptions}
                                renderItem={({ item }) => (
                                    <OptionItem
                                        item={item}
                                        onPress={handleOptionPress}
                                        isSelected={item.BinNum === value}
                                    />
                                )}
                                keyExtractor={(item) => item?.BinNum?.toString()}
                                initialNumToRender={30}
                                maxToRenderPerBatch={50}
                                updateCellsBatchingPeriod={50}
                                windowSize={5}
                                onEndReached={loadMoreData}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={!loading && <Text>No options available</Text>}
                            />
                        )}
                        {loading && page > -1 && <ActivityIndicator size="small" color="#0000ff" />}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    input: {
        fontSize: 16,
        flex: 1,
    },
    placeholder: {
        color: '#aaa',
    },
    dropdownIcon: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: 400,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: -15,
        right: -15,
        padding: 5,
        backgroundColor: 'red',
        borderRadius: 25,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
    selectedOption: {
        backgroundColor: '#f0f8ff',
    },
});

export default SelectAsync;
