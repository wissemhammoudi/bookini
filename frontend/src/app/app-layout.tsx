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

import { useColorMode } from './use-color-mode'
import { useAuth } from '../features/auth/use-auth'

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
                Bookini
              </Typography>
              <Button component={RouterLink} to="/" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/rooms" color="inherit">
                Rooms
              </Button>
              <Button component={RouterLink} to="/reservations/new" color="inherit">
                Create
              </Button>
              <Button component={RouterLink} to="/reservations" color="inherit">
                My reservations
              </Button>
              <Button component={RouterLink} to="/activities" color="inherit">
                Activities
              </Button>
              <Button component={RouterLink} to="/profile" color="inherit">
                Profile
              </Button>
              <Button component={RouterLink} to="/admin/dashboard" color="inherit">
                Admin
              </Button>
              <Button component={RouterLink} to="/super-admin/dashboard" color="inherit">
                Super Admin
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
