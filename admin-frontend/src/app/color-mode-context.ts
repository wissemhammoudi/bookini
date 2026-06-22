import { createContext } from 'react'

export type ColorModeContextValue = {
  mode: 'light' | 'dark'
  toggleMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
)
