import {z} from 'zod'

export const readingStatusSchema = z.enum(['want-to-read', 'reading', 'completed'])

export const bookSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    author: z.string().min(1, 'Author is required').max(100, 'Author name too long'),
    totalPages: z
        .number()
        .int()
        .positive('Total pages must be positive')
        .min(1, 'Must have at least 1 page'),
    isbn: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true
            return /^(?:\d{9}[\dXx]|\d{13})$/.test(val.replace(/[-\s]/g, ''))
        }, 'Invalid ISBN format'),
    coverUrl: z.string().url('Invalid cover URL').optional(),
    description: z.string().max(2000, 'Description too long').optional(),
    publishedDate: z.string().optional(),
    apiSource: z.enum(['google-books', 'open-library', 'manual']).default('manual'),
})

export type BookFormData = z.infer<typeof bookSchema>

export const progressUpdateSchema = z.object({
    bookId: z.string().min(1, 'Book ID is required'),
    currentPage: z.number().int().nonnegative('Current page cannot be negative'),
})

export const ratingSchema = z.object({
    bookId: z.string().min(1, 'Book ID is required'),
    rating: z
        .number()
        .int()
        .min(1, 'Rating must be at least 1')
        .max(10, 'Rating must be at most 10'),
})

export type RatingFormData = z.infer<typeof ratingSchema>

export const listSchema = z.object({
    name: z.string().min(1, 'List name is required').max(50, 'List name too long'),
    description: z.string().max(200, 'Description too long').optional(),
})

export type ListFormData = z.infer<typeof listSchema>

export const yearlyGoalSchema = z.object({
    booksGoal: z
        .number()
        .int()
        .positive('Goal must be positive')
        .min(1, 'Goal must be at least 1 book'),
    pagesGoal: z
        .number()
        .int()
        .positive('Goal must be positive')
        .min(1, 'Goal must be at least 1 page')
        .optional(),
})

export type YearlyGoalFormData = z.infer<typeof yearlyGoalSchema>

export const addBookSchema = z.object({
    book: bookSchema,
    initialStatus: readingStatusSchema.optional(),
    listIds: z.array(z.string()).optional(),
})

export type AddBookFormData = z.infer<typeof addBookSchema>
