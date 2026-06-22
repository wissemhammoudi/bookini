import { createContext } from 'react'

export type AuthContextValue = {
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  signIn: (payload: { accessToken: string; refreshToken: string }) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
