import {useAction} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useState, useCallback} from 'react'

export const useSearchBooks = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const searchBooks = useAction(api.openLibrarySearch.searchBooks)

    const executeSearch = useCallback(
        async (query: string, options?: {skipCache?: boolean}) => {
            if (!query || query.length < 2) {
                return {docs: [], num_found: 0, start: 0, num_found_exact: false}
            }

            setIsLoading(true)
            setError(null)

            try {
                const data = await searchBooks({query, skipCache: options?.skipCache})
                return data
            } catch (err) {
                setError(err as Error)
                return {docs: [], num_found: 0, start: 0, num_found_exact: false}
            } finally {
                setIsLoading(false)
            }
        },
        [searchBooks]
    )

    return {isLoading, error, searchBooks: executeSearch}
}

export interface OpenLibraryResponse {
    start: number
    num_found: number
    num_found_exact: boolean
    docs: OpenLibraryBook[]
}

export interface OpenLibraryBook {
    key: string
    title: string
    author_name: string[]
    author_key: string[]
    cover_i?: number
    cover_edition_key?: string
    first_publish_year?: number
    edition_count?: number
    isbn?: string[]
    language?: string[]
    publisher?: string[]
    publish_year?: number[]
    subject?: string[]
    editions?: {
        num_found: number
        start: number
        num_found_exact: boolean
        docs: Array<{
            key: string
            title: string
            covers?: number[]
            publish_date?: string
            number_of_pages?: number
            languages?: Array<{key: string}>
        }>
    }
}
