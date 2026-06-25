import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  alpha,
  Chip,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'

import { LoginForm, type LoginFormValues } from '@/features/auth/login-form'
import { useAuth } from '@/features/auth/use-auth'
import { useColorMode } from '@/app/use-color-mode'
import { getCurrentUserProfile, loginRequest } from '@/lib/api'

export const LoginPage = () => {
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signOut } = useAuth()
  const { mode, toggleMode } = useColorMode()
  const loginMutation = useMutation({ mutationFn: loginRequest })

  const handleSubmit = async (values: LoginFormValues) => {
    setError(undefined)

    try {
      const tokens = await loginMutation.mutateAsync(values)
      signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })

      const profile = await getCurrentUserProfile()
      if (profile.role === 'USER') {
        signOut()
        setError('This portal is restricted to Super Admin and Organization Admin accounts.')
        return
      }

      const nextPath =
        (location.state as { from?: string } | null)?.from ?? '/app/dashboard'
      navigate(nextPath, { replace: true })
    } catch {
      setError('Could not sign in. Please check your credentials and try again.')
    }
  }

  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight
          ? 'radial-gradient(ellipse at 20% 20%, rgba(17,111,219,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,168,143,0.10) 0%, transparent 50%), linear-gradient(135deg, #f0f5fc 0%, #e8f0fb 100%)'
          : 'radial-gradient(ellipse at 20% 20%, rgba(17,111,219,0.20) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,168,143,0.15) 0%, transparent 50%), linear-gradient(135deg, #060e1b 0%, #0d1a2e 100%)',
        position: 'relative',
        px: 2,
        overflow: 'hidden',
      }}
    >
      {/* Decorative blurred blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-8%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: isLight ? alpha('#1171d8', 0.10) : alpha('#1171d8', 0.18),
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '8%',
          right: '-6%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: isLight ? alpha('#00A88F', 0.10) : alpha('#00A88F', 0.16),
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Theme toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <IconButton
          onClick={toggleMode}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: isLight ? 'rgba(0,89,179,0.15)' : 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.05)',
            '&:hover': {
              background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.10)',
            },
          }}
        >
          {isLight ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Login card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3.5, sm: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: isLight ? 'rgba(0,89,179,0.10)' : 'rgba(255,255,255,0.07)',
          boxShadow: isLight
            ? '0 20px 60px rgba(16,24,40,0.10), 0 1px 0 rgba(255,255,255,0.9) inset'
            : '0 20px 60px rgba(0,0,0,0.45)',
          background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(13,26,48,0.90)',
          backdropFilter: 'blur(16px)',
          zIndex: 1,
        }}
      >
        <Stack spacing={3.5}>
          {/* Branding */}
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0059B3 0%, #00A88F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,89,179,0.35)',
              }}
            >
              <AdminPanelSettingsOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>

            <Stack spacing={0.5}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  background: 'linear-gradient(135deg, #0059B3 0%, #00A88F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Bookini Admin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Sign in to access your workspace
              </Typography>
            </Stack>

            <Chip
              label="Administrator Portal"
              size="small"
              sx={{
                fontSize: '0.70rem',
                fontWeight: 600,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                background: isLight ? 'rgba(0,89,179,0.08)' : 'rgba(0,89,179,0.20)',
                color: isLight ? '#0059B3' : '#5da8ff',
                border: '1px solid',
                borderColor: isLight ? 'rgba(0,89,179,0.18)' : 'rgba(93,168,255,0.25)',
                height: 24,
              }}
            />
          </Stack>

          <Divider sx={{ opacity: 0.5 }} />

          {/* Form */}
          <LoginForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={loginMutation.isPending}
          />
        </Stack>
      </Paper>
    </Box>
  )
}
