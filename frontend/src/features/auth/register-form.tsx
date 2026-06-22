import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField, InputAdornment, IconButton } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Email is invalid'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

type RegisterFormProps = {
  isLoading?: boolean
  error?: string
  onSubmit: (values: RegisterFormValues) => Promise<void> | void
}

export const RegisterForm = ({
  error,
  isLoading = false,
  onSubmit,
}: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit((v) => onSubmit(v))} noValidate>
      {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
      
      <Controller
        name="full_name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Full Name"
            autoComplete="name"
            error={Boolean(errors.full_name)}
            helperText={errors.full_name?.message}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
          />
        )}
      />

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
              }
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
            autoComplete="new-password"
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
              }
            }}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
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
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </Stack>
  )
}
