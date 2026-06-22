import { Box, Stack } from '@mui/material'

export const AuthBranding = () => {
  return (
    <Stack sx={{ alignItems: 'center', alignSelf: 'center' }}>
      <Box
        component="img"
        src="/navbar_logo.png"
        alt="Bookiblastek"
        sx={{
          height: { xs: 38, sm: 44 },
          width: 'auto',
          display: 'block',
        }}
      />
    </Stack>
  )
}
