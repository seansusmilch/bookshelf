import {Id} from 'convex/_generated/dataModel'

export type BookDetail = {
    _id: Id<'books'>
    title: string
    author: string
    description?: string
    coverUrl?: string
    currentPage: number
    totalPages: number
    status: string
    rating?: {rating: number}
}
