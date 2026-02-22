export enum CoverSize {
    Small = 'S',
    Medium = 'M',
    Large = 'L',
}

export function getCoverUrl(olid: string, size: CoverSize = CoverSize.Medium): string {
    return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`
}

export function extractOLID(key: string): string {
    const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/)
    return match ? match[1] : key
}

export function getWorkOlid(book: {key?: string}): string | undefined {
    if (!book.key) return undefined
    // Work keys are in the format /works/OLxxxW
    if (book.key.startsWith('/works/')) {
        return extractOLID(book.key)
    }
    return undefined
}

export function getEditionOlid(book: {
    editions?: {
        docs?: Array<{
            key?: string
        }>
    }
    cover_edition_key?: string
    key?: string
}): string | undefined {
    const editionKey = book.editions?.docs?.[0]?.key
    if (editionKey) return extractOLID(editionKey)
    if (book.cover_edition_key) return extractOLID(book.cover_edition_key)
    // Final fallback: if we have a work key, return it (will be resolved to edition later)
    if (book.key) return extractOLID(book.key)
    return undefined
}

/**
 * Gets the best available cover URL for a book by trying multiple sources.
 * Priority: cover_i (numeric ID) > cover_edition_key
 * Note: Work keys are NOT used as they rarely have cover images.
 */
export function getBestCoverUrl(
    book: {
        cover_i?: number
        cover_edition_key?: string
        key?: string
        editions?: {
            docs?: Array<{
                key?: string
            }>
        }
    },
    size: CoverSize = CoverSize.Medium
): string | undefined {
    // Try cover_i (numeric cover ID) first - this is the most reliable
    if (book.cover_i && book.cover_i > 0) {
        return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`
    }

    // Try cover_edition_key as fallback (edition OLID)
    if (book.cover_edition_key) {
        const olid = extractOLID(book.cover_edition_key)
        return getCoverUrl(olid, size)
    }

    // Work keys are not reliable for covers, so we don't use them
    return undefined
}

/**
 * Determines if a book has any cover identifier available.
 * Only checks for cover_i (numeric ID) or cover_edition_key (edition OLID).
 * Work keys are NOT reliable for covers, so they are not considered.
 */
export function hasCover(book: {
    cover_i?: number
    cover_edition_key?: string
    key?: string
}): boolean {
    return !!(book.cover_i && book.cover_i > 0) || !!book.cover_edition_key
}
