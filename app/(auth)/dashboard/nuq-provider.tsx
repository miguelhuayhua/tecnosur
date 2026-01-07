'use client'

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
export function NuqProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NuqsAdapter>
  )
}