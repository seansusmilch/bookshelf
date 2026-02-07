import {useQuery} from 'convex/react'
import {api} from 'convex/_generated/api'

export const useStats = (year: number = new Date().getFullYear()) => {
    return useQuery(api.stats.getReadingStats, {year})
}
