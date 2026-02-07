'use node'

// Search API Types
export interface SearchQuery {
    q: string
    fields?: string
    limit?: number
    offset?: number
    page?: number
    lang?: string
    sort?: string
}

export interface SearchResultDoc {
    key: string
    title: string
    author_name: string[]
    author_key: string[]
    cover_i?: number
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
        docs: EditionDoc[]
    }
    [key: string]: any
}

export interface EditionDoc {
    key: string
    title: string
    isbn_10?: string[]
    isbn_13?: string[]
    number_of_pages?: number
    publishers?: Array<{name: string}>
    publish_date?: string
    languages?: Array<{key: string}>
    cover_i?: number
    language?: string[]
    [key: string]: any
}

export interface SearchResponse {
    start: number
    num_found: number
    num_found_exact: boolean
    docs: SearchResultDoc[]
}

export interface EditionsResponse {
    links: {
        self: string
        work: string
        next?: string
    }
    size: number
    entries: Book[]
}

// Book/Work Types
export interface Book {
    key: string
    title: string
    subtitle?: string
    authors?: Array<{
        key: string
        name: string
    }>
    description?: {
        type?: string
        value: string
    }
    covers?: number[]
    subject_times?: Array<{name: string}>
    subject_places?: Array<{name: string}>
    subject_people?: Array<{name: string}>
    subjects?: Array<{name: string; url: string}>
    publishers?: Array<{name: string}>
    publish_places?: Array<{name: string}>
    publish_date?: string
    languages?: Array<{key: string}>
    number_of_pages?: number
    physical_format?: string
    editions?: string[]
    works?: Array<{key: string}>
    isbn_10?: string[]
    isbn_13?: string[]
    oclc_numbers?: string[]
    lccn?: string[]
    lc_classifications?: string[]
    dewey_decimal_class?: string[]
    notes?: string
    created?: {value: string}
    last_modified?: {value: string}
    latest_revision?: number
    revision?: number
    [key: string]: any
}

export interface Work {
    key: string
    title: string
    description?: {
        type?: string
        value: string
    }
    covers?: number[]
    subject_places?: Array<{name: string}>
    subject_people?: Array<{name: string}>
    subjects?: Array<{name: string; url: string}>
    authors?: Array<{
        type?: {key: string}
        author: {key: string; name: string}
    }>
    created?: {value: string}
    last_modified?: {value: string}
    latest_revision?: number
    revision?: number
}

export interface Author {
    key: string
    name: string
    alternate_names?: string[]
    birth_date?: string
    death_date?: string
    photos?: number[]
    bio?: {
        type?: string
        value: string
    }
    created?: {value: string}
    last_modified?: {value: string}
    latest_revision?: number
    revision?: number
    works?: Array<{key: string; title: string}>
    [key: string]: any
}

// ISBN API Types
export interface ISBNResponse {
    key: string
    title: string
    subtitle?: string
    authors?: Array<{
        key: string
        name: string
    }>
    description?: {
        type?: string
        value: string
    }
    covers?: number[]
    isbn_10?: string[]
    isbn_13?: string[]
    number_of_pages?: number
    publishers?: Array<{name: string}>
    publish_date?: string
    subjects?: Array<{name: string; url: string}>
    languages?: Array<{key: string}>
    [key: string]: any
}

// Cover Types
export interface CoverSize {
    S: 'small'
    M: 'medium'
    L: 'large'
}

export type CoverKeyType = 'id' | 'olid' | 'isbn' | 'oclc' | 'lccn'

// Error Types
export class OpenLibraryError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public endpoint?: string
    ) {
        super(message)
        this.name = 'OpenLibraryError'
    }
}
