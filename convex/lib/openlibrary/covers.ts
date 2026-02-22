'use node'

import {CoverSize, CoverKeyType} from './types'

type Size = keyof CoverSize

const COVER_SIZES: Record<Size, string> = {
    S: 'small',
    M: 'medium',
    L: 'large',
}

export function getBookCoverURL(
    key: CoverKeyType,
    value: string | number,
    size: Size = 'M'
): string {
    const baseUrl = 'https://covers.openlibrary.org/b'
    return `${baseUrl}/${key}/${value}-${size}.jpg`
}

export function getBookCoverByOLID(olid: string, size: Size = 'M'): string {
    return getBookCoverURL('olid', olid, size)
}

export function getBookCoverByISBN(isbn: string, size: Size = 'M'): string {
    const cleanedISBN = isbn.replace(/[\s-]/g, '')
    return getBookCoverURL('isbn', cleanedISBN, size)
}

export function getBookCoverByID(coverId: number, size: Size = 'M'): string {
    return getBookCoverURL('id', coverId, size)
}

export function getAuthorPhotoURL(key: 'id' | 'olid', value: string, size: Size = 'M'): string {
    const baseUrl = 'https://covers.openlibrary.org/a'
    return `${baseUrl}/${key}/${value}-${size}.jpg`
}

export function getAuthorPhotoByOLID(olid: string, size: Size = 'M'): string {
    return getAuthorPhotoURL('olid', olid, size)
}

export async function getCoverMetadata(
    key: CoverKeyType,
    value: string | number
): Promise<{url: string; [key: string]: any}> {
    const url = getBookCoverURL(key, value, 'L').replace('.jpg', '.json')

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch cover metadata: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching cover metadata:', error)
        return {url: getBookCoverURL(key, value, 'M')}
    }
}

export async function checkCoverExists(olid: string): Promise<boolean> {
    const url = `https://covers.openlibrary.org/b/olid/${olid}.json`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            return false
        }
        const data = await response.json()
        // Open Library returns { error: "Not Found" } if no cover
        return !data.error
    } catch (error) {
        console.error('Error checking cover for olid:', olid, error)
        return false
    }
}
