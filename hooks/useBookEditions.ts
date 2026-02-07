import {useState, useCallback, useEffect} from 'react'
import {useAction} from 'convex/react'
import {api} from 'convex/_generated/api'
import {fetchOpenLibrary, extractOLID} from 'convex/lib/openlibrary/client'
import {CoverSize, getCoverUrl} from '~/lib/openlibrary'

type BookDetails = {
    key: string
    title: string
    pageCount?: number
    publishDate?: string
    coverUrl?: string
    isbn10?: string[]
    isbn13?: string[]
    publishers?: {name: string}[]
    author: string
    description?: string
}

type UseBookEditionsProps = {
    workId: string | undefined
    authorFallback?: string
    coverUrlFallback?: string
    titleFallback?: string
}

export const useBookEditions = ({
    workId: paramId,
    authorFallback,
    coverUrlFallback,
    titleFallback,
}: UseBookEditionsProps) => {
    const getBookDetailsAction = useAction(api.openLibrarySearch.getBookDetails)
    const getWork = useAction(api.openLibrarySearch.getWork)

    const [bookDetails, setBookDetails] = useState<BookDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [workTitle, setWorkTitle] = useState<string | undefined>(
        titleFallback ? decodeURIComponent(titleFallback) : undefined
    )

    const [initialCoverUrl] = useState<string | undefined>(
        coverUrlFallback ? decodeURIComponent(coverUrlFallback) : undefined
    )
    const [initialAuthor] = useState<string | undefined>(
        authorFallback ? decodeURIComponent(authorFallback) : undefined
    )

    const loadBookDetails = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            if (!paramId) {
                throw new Error('workId parameter is missing')
            }

            const olid = paramId.startsWith('/') ? paramId : `/books/${paramId}`
            const edition = await getBookDetailsAction({openLibraryId: olid})

            // Resolve author
            let author = 'Unknown Author'
            if (edition.authors && edition.authors.length > 0) {
                const firstAuthor = edition.authors[0]
                if (firstAuthor.name) {
                    author = firstAuthor.name
                } else if (firstAuthor.key) {
                    try {
                        const authorOlid = extractOLID(firstAuthor.key, 'author')
                        const authorData = await fetchOpenLibrary<{name: string}>(
                            `/authors/${authorOlid}.json`
                        )
                        if (authorData.name) {
                            author = authorData.name
                        }
                    } catch {
                        // Fall through to default
                    }
                }
            }

            // Get description from the edition first, then fall back to the work
            let description: string | undefined
            if (edition.description) {
                description =
                    typeof edition.description === 'string'
                        ? edition.description
                        : edition.description.value
            } else {
                const workKey = edition.works?.[0]?.key
                if (workKey) {
                    try {
                        const work = await getWork({openLibraryId: workKey})
                        if (work.description) {
                            description =
                                typeof work.description === 'string'
                                    ? work.description
                                    : work.description.value
                        }
                        if (work.title && !titleFallback) {
                            setWorkTitle(work.title)
                        }
                    } catch {
                        // Description is optional, continue without it
                    }
                }
            }

            const editionOlid = edition.key.split('/').pop()
            const coverUrl = editionOlid ? getCoverUrl(editionOlid, CoverSize.Medium) : undefined

            const finalAuthor =
                typeof author === 'string' && author.trim()
                    ? author.trim()
                    : initialAuthor || 'Unknown Author'

            setBookDetails({
                key: edition.key,
                title: edition.title,
                pageCount: edition.number_of_pages,
                publishDate: edition.publish_date,
                coverUrl,
                isbn10: edition.isbn_10,
                isbn13: edition.isbn_13,
                publishers: edition.publishers,
                author: finalAuthor,
                description,
            })
        } catch {
            setError('Failed to load book details. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [paramId, getBookDetailsAction, getWork, titleFallback, initialAuthor])

    const reload = useCallback(() => {
        loadBookDetails()
    }, [loadBookDetails])

    useEffect(() => {
        loadBookDetails()
    }, [loadBookDetails])

    return {
        bookDetails,
        isLoading,
        error,
        workTitle,
        initialCoverUrl,
        initialAuthor,
        reload,
    }
}
