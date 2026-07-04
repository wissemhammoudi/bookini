import { renderHook, act } from '@testing-library/react'

import { AuthProvider } from './auth-context'
import { useAuth } from './use-auth'

describe('AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('stores tokens on signIn and clears on signOut', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)

    act(() => {
      result.current.signIn({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(window.localStorage.getItem('bookiwa7dek_admin_access_token')).toBe('access-token')
    expect(window.localStorage.getItem('bookiwa7dek_admin_refresh_token')).toBe('refresh-token')

    act(() => {
      result.current.signOut()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(window.localStorage.getItem('bookiwa7dek_admin_access_token')).toBeNull()
    expect(window.localStorage.getItem('bookiwa7dek_admin_refresh_token')).toBeNull()
  })
})
