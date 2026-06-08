import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { LoginPage } from './login-page'
import { AuthProvider } from '../features/auth/auth-context'

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('shows validation errors for invalid credentials form input', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()

    render(<LoginPage />, { wrapper: Wrapper })

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument()
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
  })
})
