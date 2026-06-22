import {
  type PropsWithChildren,
  useMemo,
  useState,
} from 'react'
import { AuthContext } from './auth-context-object'
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from './auth-storage'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken())
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    getStoredRefreshToken(),
  )

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      isAuthenticated: Boolean(token && refreshToken),
      signIn: (payload: { accessToken: string; refreshToken: string }) => {
        setStoredTokens(payload.accessToken, payload.refreshToken)
        setToken(payload.accessToken)
        setRefreshToken(payload.refreshToken)
      },
      signOut: () => {
        clearStoredTokens()
        setToken(null)
        setRefreshToken(null)
      },
    }),
    [refreshToken, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
