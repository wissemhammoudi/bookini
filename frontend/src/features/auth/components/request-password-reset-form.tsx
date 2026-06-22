import { Alert, Button, Stack, TextField, InputAdornment, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import EmailIcon from '@mui/icons-material/Email'

const requestSchema = z.object({
  email: z.email('Email is invalid'),
})

export type RequestValues = z.infer<typeof requestSchema>

type RequestFormProps = {
  error: string | null
  isLoading: boolean
  onSubmit: (values: RequestValues) => Promise<void> | void
}

export const RequestPasswordResetForm = ({ error, isLoading, onSubmit }: RequestFormProps) => {
  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  return (
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
        onSubmit={requestForm.handleSubmit(onSubmit)}
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
          {isLoading ? 'Sending request...' : 'Send Reset Link'}
        </Button>
      </Stack>
    </>
  )
}
