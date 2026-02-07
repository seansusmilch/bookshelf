'use node'

import {fetchOpenLibrary} from './client'
import {ISBNResponse} from './types'

export async function getBookByISBN(isbn: string): Promise<ISBNResponse> {
    const cleanedISBN = isbn.replace(/[\s-]/g, '')

    const isbn10Pattern = /^\d{9}[\dX]$/
    const isbn13Pattern = /^\d{13}$/

    if (!isbn10Pattern.test(cleanedISBN) && !isbn13Pattern.test(cleanedISBN)) {
        throw new Error(`Invalid ISBN format: ${isbn}`)
    }

    return fetchOpenLibrary<ISBNResponse>(`/isbn/${cleanedISBN}.json`)
}

export function validateISBN(isbn: string): boolean {
    const cleaned = isbn.replace(/[\s-]/g, '').toUpperCase()

    if (/^\d{9}[\dX]$/.test(cleaned)) {
        let sum = 0
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * (10 - i)
        }
        const checkDigit = cleaned[9] === 'X' ? 10 : parseInt(cleaned[9])
        return sum % 11 === checkDigit
    }

    if (/^\d{13}$/.test(cleaned)) {
        let sum = 0
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 1 : 3)
        }
        return sum % 10 === 0
    }

    return false
}

export function convertISBN10to13(isbn10: string): string | null {
    if (!validateISBN(isbn10)) return null

    const cleaned = isbn10.replace(/[\s-]/g, '').toUpperCase()
    const prefix = '978'
    const digits = prefix + cleaned.slice(0, 9)

    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10

    return digits + checkDigit
}
