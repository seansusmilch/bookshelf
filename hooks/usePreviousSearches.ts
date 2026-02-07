import {useState, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'previous_searches'

export const usePreviousSearches = () => {
    const [searches, setSearches] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadSearches()
    }, [])

    const loadSearches = async () => {
        try {
            const savedSearches = await AsyncStorage.getItem(STORAGE_KEY)
            if (savedSearches) {
                setSearches(JSON.parse(savedSearches))
            }
        } catch (error) {
            console.error('Failed to load previous searches:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const saveSearch = async (query: string) => {
        if (!query.trim()) return

        try {
            const existingSearches = await AsyncStorage.getItem(STORAGE_KEY)
            const parsedSearches: string[] = existingSearches ? JSON.parse(existingSearches) : []

            const filteredSearches = parsedSearches.filter((s) => s !== query)
            const updatedSearches = [query, ...filteredSearches].slice(0, 20)

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches))
            setSearches(updatedSearches)
        } catch (error) {
            console.error('Failed to save search:', error)
        }
    }

    const deleteSearch = async (query: string) => {
        try {
            const existingSearches = await AsyncStorage.getItem(STORAGE_KEY)
            const parsedSearches: string[] = existingSearches ? JSON.parse(existingSearches) : []

            const updatedSearches = parsedSearches.filter((s) => s !== query)

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches))
            setSearches(updatedSearches)
        } catch (error) {
            console.error('Failed to delete search:', error)
        }
    }

    const clearAllSearches = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY)
            setSearches([])
        } catch (error) {
            console.error('Failed to clear searches:', error)
        }
    }

    return {
        searches,
        isLoading,
        saveSearch,
        deleteSearch,
        clearAllSearches,
    }
}
