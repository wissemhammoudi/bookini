import {
  type PropsWithChildren,
  useMemo,
  useState,
} from 'react'
import { AuthContext } from './auth-context-object'

const AUTH_TOKEN_KEY = 'bookini_auth_token'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  )

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      signIn: (nextToken: string) => {
        localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
        setToken(nextToken)
      },
      signOut: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
