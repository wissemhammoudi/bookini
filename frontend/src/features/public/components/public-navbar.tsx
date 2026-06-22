import { useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { useAuth } from '@/features/auth/use-auth'

interface PublicNavbarProps {
  isLight: boolean
}

const getSubFromToken = (token: string | null) => {
  if (!token) return 'User'

  try {
    const payload = token.split('.')[1]
    if (!payload) return 'User'

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = JSON.parse(window.atob(padded)) as { sub?: string }

    return decoded.sub?.trim() || 'User'
  } catch {
    return 'User'
  }
}

const getInitials = (value: string) => {
  const cleaned = value.replace(/@.*/, '').trim()
  if (!cleaned) return 'U'

  const parts = cleaned.split(/[.\s_-]+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

export const PublicNavbar = ({ isLight }: PublicNavbarProps) => {
  const { mode, toggleMode } = useColorMode()
  const { isAuthenticated, signOut, token } = useAuth()
  const navigate = useNavigate()

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchorEl)

  const userLabel = useMemo(() => getSubFromToken(token), [token])
  const avatarText = useMemo(() => getInitials(userLabel), [userLabel])

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
  }

  const handleSignOut = () => {
    signOut()
    handleCloseMenu()
    navigate('/')
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: alpha(isLight ? '#ffffff' : '#0f1419', isLight ? 0.78 : 0.7),
        backdropFilter: 'blur(18px)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Toolbar>
        <Container
          maxWidth="lg"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '1.1rem',
                fontWeight: 800,
              }}
            >
              bookiwa7dek
            </Typography>

            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={RouterLink} to="/about" color="inherit">
                About
              </Button>
              <Button component={RouterLink} to="/reservations-info" color="inherit">
                Reservation
              </Button>
              <Button component={RouterLink} to="/contact" color="inherit">
                Contact
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton onClick={toggleMode} color="inherit" size="small">
              {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>

            {!isAuthenticated ? (
              <Button component={RouterLink} to="/login" variant="outlined" size="small">
                Sign In
              </Button>
            ) : (
              <>
                <IconButton onClick={handleOpenMenu} sx={{ p: 0.25 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {avatarText}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={menuOpen}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        border: '1px solid',
                        borderColor: isLight
                          ? 'rgba(0, 89, 179, 0.08)'
                          : 'rgba(255, 255, 255, 0.08)',
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu()
                      navigate('/profile')
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu()
                      navigate('/book')
                    }}
                  >
                    Reservation
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
