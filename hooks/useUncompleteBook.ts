import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useConvex} from 'convex/react'
import {Id} from 'convex/_generated/dataModel'
import {api} from 'convex/_generated/api'
import {useToast} from './useToast'

export const useUncompleteBook = () => {
    const toast = useToast()
    const queryClient = useQueryClient()
    const convex = useConvex()

    return useMutation({
        mutationFn: (bookId: Id<'books'>) => convex.mutation(api.books.uncompleteBook, {bookId}),
        onSuccess: () => {
            toast.showSuccess('Completion undone!')
            queryClient.invalidateQueries({queryKey: ['books']})
            queryClient.invalidateQueries({queryKey: ['stats']})
        },
        onError: (error: Error) => {
            toast.showError('Failed to undo completion')
            console.error('Uncomplete book error:', error)
        },
    })
}
