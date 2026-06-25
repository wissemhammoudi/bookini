import { Alert, Typography } from '@mui/material'

export const BookingSupportAlert = () => {
  return (
    <Alert severity="info" sx={{ borderRadius: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Questions about your booking?
      </Typography>
      <Typography variant="body2" color="inherit">
        Contact support@bookiwa7dek.com or call +216 00 000 000 if you need changes or assistance.
      </Typography>
    </Alert>
  )
}
