import { useState } from 'react'
import { Alert, Button, Stack, TextField, InputAdornment, IconButton, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import LockIcon from '@mui/icons-material/Lock'
import KeyIcon from '@mui/icons-material/Key'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

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

export type ConfirmValues = z.infer<typeof confirmSchema>

type ConfirmFormProps = {
  devToken: string | null
  error: string | null
  isLoading: boolean
  onSubmit: (values: ConfirmValues) => Promise<void> | void
}

export const ConfirmPasswordResetForm = ({
  devToken,
  error,
  isLoading,
  onSubmit,
}: ConfirmFormProps) => {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const confirmForm = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { token: '', new_password: '', confirm_password: '' },
  })

  return (
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
        onSubmit={confirmForm.handleSubmit(onSubmit)}
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
          disabled={isLoading}
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
          {isLoading ? 'Resetting password...' : 'Confirm Reset'}
        </Button>
      </Stack>
    </>
  )
}
