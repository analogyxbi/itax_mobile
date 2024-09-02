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
import { useDispatch } from 'react-redux';
import useSearch from '../hooks/useSearch';

const MultiSelectAsync = ({
    label,
    value, // Single value for single select or array for multi select
    onChange,
    placeholder,
    fetchOptions, // Function to fetch options from the server
    warehouse,
    multi = false, // Prop to determine if multi-select is enabled
    apiLimit = 100,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    // const [searchText, setSearchText] = useState('');
    // const [options, setOptions] = useState([]);
    // const [filteredOptions, setFilteredOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(-1);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch();
        // Use the custom hook
        const {
            options,
            filteredOptions,
            onSearchChange,
            searchText,
            setOptions,
            setSearchText,
            setFilteredOptions
        } = useSearch(fetchOptions, warehouse, apiLimit, setPage, setLoading, setHasMore);

    // // Debounced search handler
    // const handleSearch = useCallback(
    //     debounce(async (text) => {
    //         // if (text.trim() === '') {
    //         //     setPage(-1)
    //         //     return
    //         // }; // Avoid unnecessary API calls for empty searches

    //         setLoading(true);
    //         setPage(-1); // Reset to first page on new search
    //         setHasMore(true)
    //         try {
    //             const result = await fetchOptions(text, 0, warehouse, apiLimit); // Fetch first page
    //             setOptions(result.data);
    //             setFilteredOptions(result.data);
    //             setHasMore(result.hasMore);
    //         } catch (error) {
    //             dispatch(showSnackbar('Failed to fetch options.'))
    //             // Alert.alert('Error', 'Failed to fetch options');
    //         } finally {
    //             setLoading(false);
    //         }
    //     }, 300),
    //     [fetchOptions, warehouse, searchText]
    // );

    // // Handle search input change
    // const onSearchChange = (text) => {
    //     setSearchText(text);
    //     handleSearch(text);
    // };

    const loadMoreData = async () => {
        if (!hasMore || loading) return;

        setLoading(true);

        try {
            const result = await fetchOptions(searchText, page + 1, warehouse, apiLimit);

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


    const handleSelectAll = () => {
        if (multi) {
            const allOptions = filteredOptions.map(option => option.BinNum);
            onChange([...new Set([...value, ...allOptions])]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
    };


    useEffect(() => {
        if (modalVisible) {
            setHasMore(true);
            loadMoreData();
        }
    }, [warehouse, modalVisible]);

    const handleOptionPress = (option) => {
        if (multi) {
            // Handle multi-select
            const newValues = value.includes(option.BinNum)
                ? value.filter(val => val !== option.BinNum) // Remove option if it's already selected
                : [...value, option.BinNum]; // Add option if it's not selected
              
            onChange(newValues);
        } else {
            // Handle single-select
            onChange(option.BinNum);
            closeModal();
        }
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
            onPress={() => onPress(item)}
        >
            <Text style={styles.optionText}>{item.BinNum}</Text>
            {isSelected && (
                <Ionicons name="checkmark" size={20} color="#007BFF" />
            )}
        </TouchableOpacity>
    ));
    
    const renderSelectedOptions = () => {
        const maxVisible = 15;
        const visibleOptions = value.slice(0, maxVisible);
        const moreCount = value.length - maxVisible;

        return (
            <View style={styles.selectedOptionsContainer}>
                {visibleOptions.map((option) => (
               
                        <View key={option} style={styles.selectedChip}>
                            <Text style={styles.selectedChipText}>{option}</Text>
                        </View>
                   
                ))}
                {moreCount > 0 && (
        
                        <View style={styles.selectedChip}>
                            <Text style={styles.selectedChipText}>
                                +{moreCount} more
                            </Text>
                        </View>
             
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
            >
                {renderSelectedOptions()}
                <View style={styles.iconContainer}>
                    {value.length > 0 ? (
                        <Ionicons
                            name="close-circle"
                            size={24}
                            color="#FF0000"
                            onPress={handleClearAll}
                        />
                    ) : (
                        <Ionicons
                            name="chevron-down"
                            size={24}
                            color="#000"
                        />
                    )}
                </View>
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
                        <TouchableOpacity
                            style={styles.selectAllButton}
                            onPress={handleSelectAll}
                        >
                            <Text style={styles.selectAllText}>Select All</Text>
                        </TouchableOpacity>
                        {loading && page === -1 ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                data={filteredOptions}
                                renderItem={({ item }) => (
                                    <OptionItem
                                        item={item}
                                        onPress={handleOptionPress}
                                        isSelected={value.includes(item.BinNum)}
                                    />
                                )}
                                keyExtractor={(item) => item.BinNum.toString()}
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
        paddingHorizontal:15,
        borderRadius: 5,
        display:"flex",
        justifyContent:'space-between'
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
    selectAllButton: {
        paddingVertical: 10,
    },
    selectAllText: {
        fontSize: 16,
        color: '#007BFF',
        textAlign: 'center',
    },
    showMoreButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    showMoreText: {
        fontSize: 16,
        color: '#007BFF',
    },
      selectedOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex:1
    },
    selectedChip: {
        backgroundColor: '#f0f8ff',
        padding: 5,
        margin: 2,
        borderRadius: 15,
    },
    selectedChipText: {
        fontSize: 14,
        color: '#007BFF',
    },
});

export default MultiSelectAsync;
