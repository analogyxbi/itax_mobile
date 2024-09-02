import { useState, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../Snackbar/messageSlice';

// Custom hook for searching with debouncing and request cancellation
const useSearch = (fetchOptions, warehouse, apiLimit, setPage, setLoading, setHasMore) => {
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch()
    const searchIdRef = useRef(0); // Ref to track the current search request
    const abortControllerRef = useRef(null); // Ref to keep the current AbortController

    // Debounced search handler
    const handleSearch = useCallback(
        debounce(async (text) => {
            const searchId = ++searchIdRef.current; // Increment and store new searchId
            setLoading(true);
            setPage(-1); // Reset to first page on new search
            setHasMore(true);

            // Abort any ongoing fetch request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();
            const { signal } = abortControllerRef.current;

            try {
                const result = await fetchOptions(text, 0, warehouse, apiLimit, { signal }); // Pass signal to fetch
                if (searchId === searchIdRef.current) { // Only update if this is the latest search
                    setOptions(result.data);
                    setFilteredOptions(result.data);
                    setHasMore(result.hasMore);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    dispatch(showSnackbar('Failed to fetch options.'));
                    // Alert.alert('Error', 'Failed to fetch options');
                }
            } finally {
                if (searchId === searchIdRef.current) {
                    setLoading(false);
                }
            }
        }, 300),
        [fetchOptions, warehouse, apiLimit] // Adjust dependencies as necessary
    );

    // Handle search input change
    const onSearchChange = (text) => {
        setSearchText(text);
        handleSearch(text);
    };

    return {
        options,
        filteredOptions,
        onSearchChange,
        searchText,
        setSearchText,
        setOptions,
        setFilteredOptions
    };
};

export default useSearch;
