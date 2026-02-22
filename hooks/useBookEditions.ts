import {useState, useCallback, useEffect} from 'react'
import {useAction} from 'convex/react'
import {api} from 'convex/_generated/api'
import {fetchOpenLibrary, extractOLID} from 'convex/lib/openlibrary/client'
import {CoverSize, getCoverUrl} from '~/lib/openlibrary'
import type {Book} from 'convex/lib/openlibrary/types'

export type BookDetails = {
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
    const getWorkEditions = useAction(api.openLibrarySearch.getWorkEditions)

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

            // Determine if we have a work key or edition/book key
            const isWorkKey =
                paramId.startsWith('/works/') || (paramId.startsWith('OL') && paramId.endsWith('W'))

            let edition: Book | undefined
            if (isWorkKey) {
                // If we have a work key, fetch the work editions first
                const workId = paramId.startsWith('/') ? paramId : `/works/${paramId}`
                try {
                    const editions = await getWorkEditions({openLibraryId: workId})
                    // Get the first edition from the work
                    if (editions && editions.length > 0) {
                        const firstEditionKey = editions[0].key
                        if (firstEditionKey) {
                            edition = await getBookDetailsAction({openLibraryId: firstEditionKey})
                        }
                    }
                } catch (workError) {
                    console.error(
                        'Failed to fetch work editions, trying direct book fetch:',
                        workError
                    )
                    // If work fetch fails, try as a book key anyway
                    const bookId = paramId.startsWith('/') ? paramId : `/books/${paramId}`
                    edition = await getBookDetailsAction({openLibraryId: bookId})
                }
            } else {
                // Normal book/edition key path
                const olid = paramId.startsWith('/') ? paramId : `/books/${paramId}`
                edition = await getBookDetailsAction({openLibraryId: olid})
            }

            if (!edition) {
                throw new Error('Failed to load book details')
            }

            // Resolve author - try edition first, then work
            let author = 'Unknown Author'
            let authorResolved = false

            // First try to get author from edition
            if (edition.authors && edition.authors.length > 0) {
                const firstAuthor = edition.authors[0]
                if (firstAuthor.name) {
                    author = firstAuthor.name
                    authorResolved = true
                } else if (firstAuthor.key) {
                    try {
                        const authorOlid = extractOLID(firstAuthor.key, 'author')
                        const authorData = await fetchOpenLibrary<{name: string}>(
                            `/authors/${authorOlid}.json`
                        )
                        if (authorData.name) {
                            author = authorData.name
                            authorResolved = true
                        }
                    } catch {
                        // Fall through to try work
                    }
                }
            }

            // If author not found in edition, try to get from work
            if (!authorResolved) {
                const workKey = edition.works?.[0]?.key
                if (workKey) {
                    try {
                        const work = await getWork({openLibraryId: workKey})
                        // Work authors have a different structure: [{type: {key: ...}, author: {key: "/authors/..."}}]
                        if (work.authors && work.authors.length > 0) {
                            const workAuthor = work.authors[0]
                            const authorKey = workAuthor.author?.key
                            if (authorKey) {
                                const authorOlid = extractOLID(authorKey, 'author')
                                const authorData = await fetchOpenLibrary<{name: string}>(
                                    `/authors/${authorOlid}.json`
                                )
                                if (authorData.name) {
                                    author = authorData.name
                                    authorResolved = true
                                }
                            }
                        }
                        // Also get work title and description while we have the work data
                        if (work.title && !titleFallback) {
                            setWorkTitle(work.title)
                        }
                    } catch {
                        // Fall through to default author
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
            } else if (!authorResolved) {
                // If we didn't fetch the work above for author, fetch it now for description
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
