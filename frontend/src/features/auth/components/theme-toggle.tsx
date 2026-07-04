import { Box, IconButton } from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { useColorMode } from '@/app/use-color-mode'

export const ThemeToggle = () => {
  const { mode, toggleMode } = useColorMode()
  const isLight = mode === 'light'

  return (
    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
      >
        {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Box>
  )
}
