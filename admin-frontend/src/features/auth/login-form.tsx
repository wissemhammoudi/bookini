import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField, InputAdornment, IconButton } from '@mui/material'
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
      spacing={2.5}
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
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
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </Stack>
  )
}
