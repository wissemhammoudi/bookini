import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Link,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import KeyIcon from '@mui/icons-material/Key'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'

import { useColorMode } from '@/app/use-color-mode'
import { requestPasswordReset, confirmPasswordReset } from '@/lib/api'

const requestSchema = z.object({
  email: z.email('Email is invalid'),
})

type RequestValues = z.infer<typeof requestSchema>

const confirmSchema = z
  .object({
    token: z.string().min(10, 'Token must be at least 10 characters'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

type ConfirmValues = z.infer<typeof confirmSchema>

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request')
  const [devToken, setDevToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mode, toggleMode } = useColorMode()

  const requestMutation = useMutation({ mutationFn: requestPasswordReset })
  const confirmMutation = useMutation({ mutationFn: confirmPasswordReset })

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const confirmForm = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { token: '', new_password: '', confirm_password: '' },
  })

  const handleRequestSubmit = async (values: RequestValues) => {
    setError(null)
    try {
      const response = await requestMutation.mutateAsync({ email: values.email })
      if (response && response.reset_token) {
        setDevToken(response.reset_token)
      }
      setStep('confirm')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not request password reset. Please try again.')
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not reset password. Please check your token and try again.')
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
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          onClick={toggleMode}
          color="inherit"
          sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
        >
          {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </Box>

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
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', alignSelf: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 10px rgba(0, 89, 179, 0.3)',
                }}
              >
                <MeetingRoomIcon sx={{ color: '#ffffff' }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                bookiwa7dek
              </Typography>
            </Stack>

            {step === 'request' && (
              <>
                <Stack spacing={1}>
                  <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                    Forgot Password?
                  </Typography>
                  <Typography color="text.secondary" align="center" variant="body2">
                    Enter your email address and we'll send you a token to reset your password.
                  </Typography>
                </Stack>

                <Stack
                  component="form"
                  spacing={2.5}
                  onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
                  noValidate
                >
                  {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                  <Controller
                    name="email"
                    control={requestForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        error={Boolean(requestForm.formState.errors.email)}
                        helperText={requestForm.formState.errors.email?.message}
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={requestMutation.isPending}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0, 89, 179, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(0, 89, 179, 0.3)',
                      },
                    }}
                  >
                    {requestMutation.isPending ? 'Sending request...' : 'Send Reset Link'}
                  </Button>
                </Stack>
              </>
            )}

            {step === 'confirm' && (
              <>
                <Stack spacing={1}>
                  <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                    Reset Password
                  </Typography>
                  <Typography color="text.secondary" align="center" variant="body2">
                    Please paste the reset token sent to your email and select a new secure password.
                  </Typography>
                </Stack>

                {devToken && (
                  <Alert
                    severity="info"
                    sx={{ borderRadius: 3, border: '1px dashed', borderColor: 'info.main' }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => confirmForm.setValue('token', devToken)}
                        sx={{ fontWeight: 700 }}
                      >
                        Autofill
                      </Button>
                    }
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Dev Environment Token:
                    </Typography>
                    <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{devToken}</code>
                  </Alert>
                )}

                <Stack
                  component="form"
                  spacing={2.5}
                  onSubmit={confirmForm.handleSubmit(handleConfirmSubmit)}
                  noValidate
                >
                  {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                  <Controller
                    name="token"
                    control={confirmForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Reset Token"
                        error={Boolean(confirmForm.formState.errors.token)}
                        helperText={confirmForm.formState.errors.token?.message}
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <KeyIcon color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="new_password"
                    control={confirmForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        error={Boolean(confirmForm.formState.errors.new_password)}
                        helperText={confirmForm.formState.errors.new_password?.message}
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                  size="small"
                                >
                                  {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="confirm_password"
                    control={confirmForm.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={Boolean(confirmForm.formState.errors.confirm_password)}
                        helperText={confirmForm.formState.errors.confirm_password?.message}
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  size="small"
                                >
                                  {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={confirmMutation.isPending}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0, 89, 179, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(0, 89, 179, 0.3)',
                      },
                    }}
                  >
                    {confirmMutation.isPending ? 'Resetting password...' : 'Confirm Reset'}
                  </Button>
                </Stack>
              </>
            )}

            {step === 'success' && (
              <Stack spacing={3.5} sx={{ alignItems: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', width: 64, height: 64 }}>
                  <CheckCircleOutlinedIcon sx={{ color: 'success.main', fontSize: 36 }} />
                </Avatar>
                <Stack spacing={1} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Password Reset!
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </Typography>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                >
                  Back to Login
                </Button>
              </Stack>
            )}

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
    </Box>
  )
}
