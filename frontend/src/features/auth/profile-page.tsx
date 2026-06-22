import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material'

import { getProfileRequest } from '@/lib/api'
import { ProfileAvatarCard, PersonalDetailsForm, ChangePasswordForm } from './components'

export const ProfilePage = () => {
  const { data: profile, refetch, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileRequest,
  })

  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.id) {
      const stored = localStorage.getItem(`avatar_${profile.id}`)
      if (stored) {
        setAvatar(stored)
      }
    }
  }, [profile?.id])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && profile?.id) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        localStorage.setItem(`avatar_${profile.id}`, base64)
        setAvatar(base64)
      }
      reader.readAsDataURL(file)
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
            avatar={avatar}
            onAvatarChange={handleAvatarChange}
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
    </Stack>
  )
}
