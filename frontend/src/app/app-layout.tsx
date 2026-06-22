import { Outlet } from 'react-router-dom'
import { Box, Container } from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from '@/features/public/components/public-navbar'

export const AppLayout = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PublicNavbar isLight={isLight} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
