import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { ColorModeProvider } from '@/app/color-mode'
import { queryClient } from '@/app/query-client'
import { AuthProvider } from '@/features/auth/auth-context'

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ColorModeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  </ColorModeProvider>
)
