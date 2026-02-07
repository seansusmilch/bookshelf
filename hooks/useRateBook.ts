import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useConvex} from 'convex/react'
import {api} from 'convex/_generated/api'
import {Id} from 'convex/_generated/dataModel'
import {useToast} from '@/hooks/useToast'

type RateBookArgs = {
    bookId: Id<'books'>
    rating: number
}

export const useRateBook = () => {
    const toast = useToast()
    const queryClient = useQueryClient()
    const convex = useConvex()

    return useMutation({
        mutationFn: (args: RateBookArgs) => convex.mutation(api.ratings.rateBook, args),
        onSuccess: () => {
            toast.showSuccess('Rating saved')
            queryClient.invalidateQueries({queryKey: ['books']})
        },
        onError: (error: Error) => {
            toast.showError('Failed to save rating')
            console.error('Rate book error:', error)
        },
    })
}
