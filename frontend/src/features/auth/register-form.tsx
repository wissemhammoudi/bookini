import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  const {
    register,
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
    <Stack component="form" spacing={2} onSubmit={handleSubmit((v) => onSubmit(v))}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Full name"
        autoComplete="name"
        error={Boolean(errors.full_name)}
        helperText={errors.full_name?.message}
        {...register('full_name')}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </Stack>
  )
}
