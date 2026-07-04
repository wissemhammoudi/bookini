import { Box, Chip, Stack, Typography } from '@mui/material'

export const DialogHeading = ({ tone, title, subtitle }: { tone: string; title: string; subtitle: string }) => (
  <Stack spacing={1}>
    <Chip label={tone} size="small" variant="outlined" sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
    </Box>
  </Stack>
)
