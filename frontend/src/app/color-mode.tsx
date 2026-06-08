import {
  type PropsWithChildren,
  useMemo,
  useState,
} from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { buildTheme } from './theme'
import { ColorModeContext } from './color-mode-context'

export const ColorModeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => (current === 'light' ? 'dark' : 'light'))
      },
    }),
    [mode],
  )

  const theme = useMemo(() => buildTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
