import { render, screen } from '@testing-library/react'

import App from '@/App'

const renderApp = () => render(<App />)

describe('Protected routes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, 'Test', '/admin/dashboard')
  })

  it('redirects unauthenticated users to login page', async () => {
    renderApp()

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
