import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  alpha,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { useQuery } from '@tanstack/react-query'

import { useColorMode } from '@/app/use-color-mode'
import { useAuth } from '@/features/auth'
import { getProfileRequest } from '@/lib/api'

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

const getFullAvatarUrl = (url: string | null | undefined) => {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1')
  if (url.startsWith('/api/v1')) {
    if (import.meta.env.DEV) {
      return `http://localhost:8000${url}`
    }
    return url
  }
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export const PublicNavbar = ({ isLight }: PublicNavbarProps) => {
  const { mode, toggleMode } = useColorMode()
  const { isAuthenticated, signOut, token } = useAuth()
  const navigate = useNavigate()

  const { data: profile, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileRequest,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    const handleUpdate = () => {
      refetch()
    }
    window.addEventListener('avatar_updated', handleUpdate)
    return () => window.removeEventListener('avatar_updated', handleUpdate)
  }, [refetch])

  const avatarUrl = useMemo(() => getFullAvatarUrl(profile?.avatar_url), [profile?.avatar_url])

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchorEl)

  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null)
  const mobileOpen = Boolean(mobileAnchorEl)
  const userLabel = useMemo(() => getSubFromToken(token), [token])
  const avatarText = useMemo(() => getInitials(userLabel), [userLabel])

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
  }

  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget)
  }

  const handleCloseMobileMenu = () => {
    setMobileAnchorEl(null)
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                color="inherit"
                onClick={handleOpenMobileMenu}
                sx={{ display: { xs: 'flex', md: 'none' }, mr: 0.5 }}
                size="small"
              >
                <MenuIcon />
              </IconButton>
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <Box
                  component="img"
                  src="/navbar_logo.png"
                  alt="Bookini"
                  sx={{
                    height: { xs: 32, sm: 38 },
                    width: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Stack>

            {/* Desktop Navigation Links */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={RouterLink} to="/about" color="inherit">
                About
              </Button>
              <Button component={RouterLink} to="/reservations-info" color="inherit">
                How It Works
              </Button>
              <Button component={RouterLink} to="/book" color="inherit">
                Book Space
              </Button>
              <Button component={RouterLink} to="/contact" color="inherit">
                Contact
              </Button>
            </Stack>
          </Stack>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileAnchorEl}
            open={mobileOpen}
            onClose={handleCloseMobileMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 200,
                  border: '1px solid',
                  borderColor: isLight
                    ? 'rgba(0, 89, 179, 0.08)'
                    : 'rgba(255, 255, 255, 0.08)',
                },
              },
            }}
          >
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseMobileMenu}>
              About
            </MenuItem>
            <MenuItem component={RouterLink} to="/reservations-info" onClick={handleCloseMobileMenu}>
              How It Works
            </MenuItem>
            <MenuItem component={RouterLink} to="/book" onClick={handleCloseMobileMenu}>
              Book Space
            </MenuItem>
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMobileMenu}>
              Contact
            </MenuItem>
          </Menu>

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
                    src={avatarUrl || undefined}
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

