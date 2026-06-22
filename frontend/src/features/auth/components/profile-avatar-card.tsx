import { Avatar, Box, Card, IconButton, Stack, Typography, alpha } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import BadgeIcon from '@mui/icons-material/Badge'

const getInitials = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

type ProfileAvatarCardProps = {
  profile: { full_name: string; email: string; role: string } | undefined
  avatar: string | null
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ProfileAvatarCard = ({ profile, avatar, onAvatarChange }: ProfileAvatarCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        background: (theme) => theme.palette.background.paper,
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={avatar || undefined}
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              boxShadow: '0 8px 24px rgba(0, 89, 179, 0.12)',
            }}
          >
            {profile ? getInitials(profile.full_name) : 'U'}
          </Avatar>
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: '#ffffff',
              border: '3px solid #ffffff',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
            size="small"
          >
            <PhotoCameraIcon fontSize="small" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={onAvatarChange}
            />
          </IconButton>
        </Box>

        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {profile?.full_name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {profile?.email}
          </Typography>
        </Stack>

        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 10,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <BadgeIcon sx={{ fontSize: 14 }} />
          {profile?.role}
        </Box>
      </Stack>
    </Card>
  )
}
