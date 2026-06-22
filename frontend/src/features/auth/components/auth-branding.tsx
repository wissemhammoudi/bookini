import { Avatar, Stack, Typography } from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

export const AuthBranding = () => {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', alignSelf: 'center' }}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 40,
          height: 40,
          boxShadow: '0 4px 10px rgba(0, 89, 179, 0.3)',
        }}
      >
        <MeetingRoomIcon sx={{ color: '#ffffff' }} />
      </Avatar>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        bookiwa7dek
      </Typography>
    </Stack>
  )
}
