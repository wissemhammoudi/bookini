import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'

import { updateProfileRequest } from '@/lib/api'

const profileInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Email is invalid'),
})

type ProfileInfoValues = z.infer<typeof profileInfoSchema>

type PersonalDetailsFormProps = {
  profile: { full_name: string; email: string } | undefined
  onSuccess: () => void
}

export const PersonalDetailsForm = ({ profile, onSuccess }: PersonalDetailsFormProps) => {
  const infoForm = useForm<ProfileInfoValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      full_name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (profile) {
      infoForm.reset({
        full_name: profile.full_name,
        email: profile.email,
      })
    }
  }, [profile, infoForm])

  const infoMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: () => {
      onSuccess()
    },
  })

  const onInfoSubmit = async (values: ProfileInfoValues) => {
    await infoMutation.mutateAsync(values)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Personal Details
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Update your personal account information and registered email address.
          </Typography>
        </Box>

        <Divider />

        <Stack
          component="form"
          spacing={3}
          onSubmit={infoForm.handleSubmit(onInfoSubmit)}
          noValidate
        >
          {infoMutation.isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {infoMutation.error instanceof Error
                ? infoMutation.error.message
                : 'Could not update profile information. Please verify your data.'}
            </Alert>
          )}
          {infoMutation.isSuccess && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Profile information updated successfully.
            </Alert>
          )}

          <TextField
            label="Full Name"
            error={Boolean(infoForm.formState.errors.full_name)}
            helperText={infoForm.formState.errors.full_name?.message}
            {...infoForm.register('full_name')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                ),
              },
            }}
          />

          <TextField
            label="Email Address"
            type="email"
            error={Boolean(infoForm.formState.errors.email)}
            helperText={infoForm.formState.errors.email?.message}
            {...infoForm.register('email')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <EmailIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={infoMutation.isPending}
            sx={{ alignSelf: 'flex-start', px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            {infoMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
