import { Box, Container, Stack, Typography } from '@mui/material'

interface PublicPageHeaderProps {
  isLight: boolean
  eyebrow: string
  title: string
  description: string
}

export const PublicPageHeader = ({ isLight, eyebrow, title, description }: PublicPageHeaderProps) => {
  return (
    <Box
      sx={{
        py: { xs: 7, md: 10 },
        background: isLight
          ? 'radial-gradient(circle at 80% 20%, rgba(15, 23, 42, 0.03) 0%, transparent 52%)'
          : 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 52%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2.25} sx={{ maxWidth: 760 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            {eyebrow}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontSize: { xs: '2.15rem', sm: '2.7rem', md: '3.2rem' },
            }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            {description}
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
