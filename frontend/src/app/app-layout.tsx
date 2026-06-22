import { Link as RouterLink, Outlet } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { useAuth } from '@/features/auth/use-auth'

export const AppLayout = () => {
  const { mode, toggleMode } = useColorMode()
  const { isAuthenticated, signOut } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container
            maxWidth="lg"
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                bookiwa7dek
              </Typography>
              <Button component={RouterLink} to="/dashboard" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/profile" color="inherit">
                Profile
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'light' ? (
                  <DarkModeOutlinedIcon />
                ) : (
                  <LightModeOutlinedIcon />
                )}
              </IconButton>
              {isAuthenticated ? (
                <Button variant="outlined" color="inherit" onClick={signOut}>
                  Sign out
                </Button>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained">
                  Sign in
                </Button>
              )}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
