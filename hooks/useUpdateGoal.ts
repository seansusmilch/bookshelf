import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useConvex} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useToast} from '@/hooks/useToast'

export const useUpdateGoal = () => {
    const toast = useToast()
    const queryClient = useQueryClient()
    const convex = useConvex()

    return useMutation({
        mutationFn: (goal: number) => {
            const currentYear = new Date().getFullYear()
            return convex.mutation(api.stats.setYearlyGoal, {year: currentYear, goal})
        },
        onSuccess: () => {
            toast.showSuccess('Reading goal updated')
            queryClient.invalidateQueries({queryKey: ['stats']})
        },
        onError: (error: Error) => {
            toast.showError('Failed to update goal')
            console.error('Update goal error:', error)
        },
    })
}
