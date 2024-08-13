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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch()
    // Debounced search handler
    const handleSearch = useCallback(
        debounce(async (text) => {
            //   if (text.trim() === '') return; // Avoid unnecessary API calls for empty searches

            setLoading(true);
            setPage(1); // Reset to first page on new search
            setHasMore(true);

            try {
                const result = await fetchOptions(text, 1, warehouse); // Fetch first page
                setOptions(result.data);
                setFilteredOptions(result.data);
                setHasMore(result.hasMore);
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch options');
            } finally {
                setLoading(false);
            }
        }, 300),
        [fetchOptions, warehouse]
    );

    // Handle search input change
    const onSearchChange = (text) => {
        setSearchText(text);
        handleSearch(text);
    };

    const loadMoreData = async (force) => {
        // If `force` is false, respect the usual conditions (loading state and `hasMore` flag)
        if (warehouse) {
            // console.log("warehouse changed")
            if (!force && (loading || !hasMore)) return;
            // console.log("Calling APi changed", warehouse)

            // Set loading state to true regardless of `force`
            setLoading(true);

            try {
                // Fetch new options
                const result = await fetchOptions(searchText, page + 1, warehouse);
              
                if (result.data.length === 0) {
                    // If no data, set hasMore to false
                    setHasMore(false);
                } else {
                    // Update options and filteredOptions with the fetched data
                   if(force){
                    setOptions((prevOptions) => [ ...result.data]);
                    setFilteredOptions((prevOptions) => [ ...result.data]);
                   }else{
                    setOptions((prevOptions) => [...prevOptions, ...result.data]);
                    setFilteredOptions((prevOptions) => [...prevOptions, ...result.data]);
                   }
                    // Update pagination state
                    setPage((prevPage) => prevPage + 1);
                }

                // Update options and filteredOptions with the fetched data
                //   setOptions((prevOptions) => [...prevOptions, ...result.data]);
                //   setFilteredOptions((prevOptions) => [...prevOptions, ...result.data]);
                //   // Update pagination state and `hasMore` flag
                //   setPage((prevPage) => prevPage + 1);
                //   setHasMore(result.hasMore);
            } catch (error) {
                // Handle error scenario
                Alert.alert('Error', 'Failed to load more options');
            } finally {
                // Reset loading state
                setLoading(false);
            }
        } else {
            dispatch(showSnackbar("Warehouse code not found. Please select the Warehouse"))
        }
    };

    useEffect(() => {

        setHasMore(true)
        loadMoreData(true)

    }, [warehouse, modalVisible])

    const handleOptionPress = (option) => {
        onChange(option);
        setModalVisible(false);
        setOptions([])
        setFilteredOptions([])
        setHasMore(true)
        setSearchText('')
        setPage(1)
    };

    const closeModal = () => {
        setModalVisible(false);
        setOptions([])
        setFilteredOptions([])
        setSearchText('')
        setHasMore(true)
        setPage(1)
    }

    const renderOption = ({ item }) => (
        <TouchableOpacity
            style={[styles.option, item.BinNum === value && styles.selectedOption]}
            onPress={() => handleOptionPress(item.BinNum)}
        >
            <Text style={styles.optionText}> {item.BinNum}  </Text>
            {item.BinNum === value && (
                <Ionicons name="checkmark" size={20} color="#007BFF" />
            )}
        </TouchableOpacity>
    );

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
                        {loading && page === 1 ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                data={filteredOptions}
                                renderItem={renderOption}
                                keyExtractor={(item) => item.BinNum.toString()} // Ensure unique key for each item
                                onEndReached={() => { }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={!loading && <Text>No options available</Text>}
                            />
                        )}
                        {loading && page > 1 && <ActivityIndicator size="small" color="#0000ff" />}
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
