import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField, InputAdornment, IconButton, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

const loginSchema = z.object({
  email: z.email('Email is invalid'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

type LoginFormProps = {
  isLoading?: boolean
  error?: string
  onSubmit: (values: LoginFormValues) => Promise<void> | void
}

export const LoginForm = ({ error, isLoading = false, onSubmit }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <Stack
      component="form"
      spacing={2.25}
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      {error ? <Alert severity="error" sx={{ borderRadius: 2, border: '1px solid', borderColor: 'rgba(214,69,69,0.18)' }}>{error}</Alert> : null}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email Address"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiFormHelperText-root': { mx: 0.25 } }}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
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
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiFormHelperText-root': { mx: 0.25 } }}
          />
        )}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
        Access is restricted to administrator accounts only.
      </Typography>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #0F6FDB 0%, #1EA88A 100%)',
          boxShadow: '0 12px 24px rgba(15, 111, 219, 0.28)',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 16px 28px rgba(15, 111, 219, 0.34)',
          },
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </Stack>
  )
}
