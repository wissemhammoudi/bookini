import { Avatar, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'

export const ResetPasswordSuccess = () => {
  return (
    <Stack spacing={3.5} sx={{ alignItems: 'center', py: 2 }}>
      <Avatar sx={{ bgcolor: 'success.light', width: 64, height: 64 }}>
        <CheckCircleOutlinedIcon sx={{ color: 'success.main', fontSize: 36 }} />
      </Avatar>
      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Password Reset!
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Your password has been successfully updated. You can now sign in with your new password.
        </Typography>
      </Stack>
      <Button
        component={RouterLink}
        to="/login"
        variant="contained"
        fullWidth
        size="large"
        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
      >
        Back to Login
      </Button>
    </Stack>
  )
}
