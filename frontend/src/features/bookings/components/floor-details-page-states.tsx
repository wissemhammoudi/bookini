import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
} from '@mui/material'

import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'

export const FloorDetailsPageLoading = ({ isLight }: { isLight: boolean }) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PublicNavbar isLight={isLight} />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">Loading floor details...</Alert>
      </Container>
      <PublicFooter isLight={isLight} />
    </Box>
  )
}

export const FloorDetailsPageNotFound = ({
  isLight,
  onBackToSpaces,
}: {
  isLight: boolean
  onBackToSpaces: () => void
}) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PublicNavbar isLight={isLight} />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={2}>
          <Alert severity="error">Floor not found.</Alert>
          <Button variant="outlined" onClick={onBackToSpaces}>
            Back to spaces
          </Button>
        </Stack>
      </Container>
      <PublicFooter isLight={isLight} />
    </Box>
  )
}
