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

export function getEditionOlid(book: {
    editions?: {
        docs?: Array<{
            key?: string
        }>
    }
    cover_edition_key?: string
}): string | undefined {
    const editionKey = book.editions?.docs?.[0]?.key
    if (editionKey) return extractOLID(editionKey)
    if (book.cover_edition_key) return extractOLID(book.cover_edition_key)
    return undefined
}
