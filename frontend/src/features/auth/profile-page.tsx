import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'

import { getProfileRequest, uploadAvatarRequest } from '@/lib/api'
import { ProfileAvatarCard, PersonalDetailsForm, ChangePasswordForm } from './components'

const getFullAvatarUrl = (url: string | null | undefined) => {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1')
  if (url.startsWith('/api/v1')) {
    if (import.meta.env.DEV) {
      return `http://localhost:8000${url}`
    }
    return url
  }
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export const ProfilePage = () => {
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }))
  }

  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileRequest,
  })

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: uploadAvatarRequest,
    onSuccess: () => {
      refetch()
      window.dispatchEvent(new Event('avatar_updated'))
      setToast({
        open: true,
        message: 'Profile avatar updated successfully!',
        severity: 'success',
      })
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to upload avatar',
        severity: 'error',
      })
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar(file)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column: Avatar Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileAvatarCard
            profile={profile}
            avatar={getFullAvatarUrl(profile?.avatar_url) || null}
            onAvatarChange={handleAvatarChange}
            isUploading={isUploading}
          />
        </Grid>

        {/* Right Column: Information & Password Updates */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Personal Details Form */}
            <PersonalDetailsForm profile={profile} onSuccess={refetch} />

            {/* Change Password Form */}
            <ChangePasswordForm />
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
