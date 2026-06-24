import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  Paper,
  Stack,
  Box,
  Link,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { requestPasswordReset, confirmPasswordReset } from '@/lib/api'
import {
  AuthBranding,
  ThemeToggle,
  RequestPasswordResetForm,
  ConfirmPasswordResetForm,
  ResetPasswordSuccess,
} from './components'
import type { RequestValues } from './components/request-password-reset-form'
import type { ConfirmValues } from './components/confirm-password-reset-form'

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request')
  const [devToken, setDevToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { mode } = useColorMode()

  const requestMutation = useMutation({ mutationFn: requestPasswordReset })
  const confirmMutation = useMutation({ mutationFn: confirmPasswordReset })

  const handleRequestSubmit = async (values: RequestValues) => {
    setError(null)
    try {
      const response = await requestMutation.mutateAsync({ email: values.email })
      if (response && response.reset_token) {
        setDevToken(response.reset_token)
      }
      setStep('confirm')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error?.response?.data?.message || 'Could not request password reset. Please try again.')
    }
  }

  const handleConfirmSubmit = async (values: ConfirmValues) => {
    setError(null)
    try {
      await confirmMutation.mutateAsync({
        token: values.token,
        new_password: values.new_password,
      })
      setStep('success')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error?.response?.data?.message || 'Could not reset password. Please check your token and try again.')
    }
  }

  const isLight = mode === 'light'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight
          ? 'linear-gradient(135deg, #f5f7fb 0%, #e4ecfa 100%)'
          : 'linear-gradient(135deg, #090e17 0%, #121e33 100%)',
        position: 'relative',
        py: 4,
        px: 2,
      }}
    >
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, alignItems: 'center' }}>
        <Paper
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: isLight
              ? '0 10px 30px rgba(0, 89, 179, 0.08)'
              : '0 10px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid',
            borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            background: isLight ? '#ffffff' : '#101d32',
          }}
        >
          <Stack spacing={3.5}>
            {/* Logo and Branding */}
            <AuthBranding />

            {step === 'request' && (
              <RequestPasswordResetForm
                error={error}
                isLoading={requestMutation.isPending}
                onSubmit={handleRequestSubmit}
              />
            )}

            {step === 'confirm' && (
              <ConfirmPasswordResetForm
                devToken={devToken}
                error={error}
                isLoading={confirmMutation.isPending}
                onSubmit={handleConfirmSubmit}
              />
            )}

            {step === 'success' && <ResetPasswordSuccess />}

            {step !== 'success' && (
              <Stack direction="row" sx={{ justifyContent: 'center', mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                  }}
                >
                  <ArrowBackIcon fontSize="inherit" /> Back to Login
                </Link>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
