import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactNode} from 'react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
        },
    },
})

interface QueryClientProviderProps {
    children: ReactNode
}

export const QueryProvider = ({children}: QueryClientProviderProps) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
