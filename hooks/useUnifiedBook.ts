import {useQuery} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useBookEditions, type BookDetails} from './useBookEditions'

type UseUnifiedBookProps = {
    olid: string | undefined
    authorFallback?: string
    coverUrlFallback?: string
    titleFallback?: string
}

type UserBook = NonNullable<ReturnType<typeof useQuery<typeof api.books.getBookByOpenLibraryId>>>

export type UnifiedBookData = {
    olData: BookDetails | null
    userBook: UserBook | null
    isLoading: boolean
    error: string | null
    workTitle: string | undefined
    reload: () => void
}

const normalizeOLID = (olid: string | undefined): string | undefined => {
    if (!olid) return undefined
    // If it already starts with /, return as-is
    if (olid.startsWith('/')) return olid
    // Otherwise, add /books/ prefix
    return `/books/${olid}`
}

export const useUnifiedBook = ({
    olid,
    authorFallback,
    coverUrlFallback,
    titleFallback,
}: UseUnifiedBookProps): UnifiedBookData => {
    const normalizedOLID = normalizeOLID(olid)

    const {
        bookDetails,
        isLoading: isLoadingOL,
        error: errorOL,
        workTitle,
        reload: reloadOL,
    } = useBookEditions({
        workId: normalizedOLID,
        authorFallback,
        coverUrlFallback,
        titleFallback,
    })

    // Query user's book by openLibraryId from the OL data (key format: /books/OLxxxM)
    const openLibraryIdToQuery = bookDetails?.key.split('/').pop()
    const userBook = useQuery(
        api.books.getBookByOpenLibraryId,
        openLibraryIdToQuery ? {openLibraryId: openLibraryIdToQuery} : 'skip'
    )

    // Combined loading state - still loading if OL data is loading
    // (ownership check runs in parallel and will update when ready)
    const isLoading = isLoadingOL

    // Combined error state - prioritize OL errors since you need that data either way
    const error = errorOL

    // Reload function triggers both data sources to refresh
    const reload = () => {
        reloadOL()
    }

    return {
        olData: bookDetails,
        userBook: userBook ?? null,
        isLoading,
        error,
        workTitle,
        reload,
    }
}
