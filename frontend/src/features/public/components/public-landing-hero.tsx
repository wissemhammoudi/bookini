import { Box, Button, Chip, Container, Grid, Stack, Typography, alpha } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import type { HeroSpace } from '../landing-page-data'

type PublicLandingHeroProps = {
  isLight: boolean
  heroSpaces: HeroSpace[]
  onPickSpaceType: (spaceType: string) => void
}

export const PublicLandingHero = ({ isLight, heroSpaces, onPickSpaceType }: PublicLandingHeroProps) => (
  <Box
    sx={{
      pt: { xs: 8, md: 12 },
      pb: { xs: 6, md: 8 },
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid',
      borderColor: isLight ? 'rgba(0, 89, 179, 0.05)' : 'rgba(255, 255, 255, 0.04)',
      background: isLight
        ? 'linear-gradient(180deg, rgba(246, 249, 253, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)'
        : 'linear-gradient(180deg, rgba(11, 15, 25, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-20%',
        right: '10%',
        width: { xs: 250, md: 450 },
        height: { xs: 250, md: 450 },
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(0, 89, 179, 0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(17, 113, 216, 0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10%',
        left: '5%',
        width: { xs: 200, md: 350 },
        height: { xs: 200, md: 350 },
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(0, 168, 143, 0.04) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0, 168, 143, 0.06) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      },
    }}
  >
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container spacing={5} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={4}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Chip
                label="Space Booking Simplified"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  borderColor: 'divider',
                }}
              />
            </Stack>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
              }}
            >
              Reserve the{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfect Space
              </Box>{' '}
              in Minutes
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 600, lineHeight: 1.6 }}>
              Bookini helps you discover and reserve meeting rooms, coworking spaces, event venues, sports facilities, and more-all from one platform.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                component={RouterLink}
                to="/book"
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.8,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'none',
                  },
                }}
              >
                Find a Space
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                variant="outlined"
                size="large"
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.8,
                  borderRadius: 3,
                  borderColor: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                  color: 'text.primary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'text.primary',
                  },
                }}
              >
                List Your Space
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: { xs: 2, sm: 4 },
              borderRadius: 5,
              background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(17, 24, 39, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Discover Spaces
            </Typography>
            {heroSpaces.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 3,
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.6),
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateX(6px)',
                    borderColor: 'text.primary',
                  },
                }}
                onClick={() => onPickSpaceType(item.name)}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      background: item.gradient,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                </Stack>
                <Box component="span" sx={{ fontSize: 16, color: 'text.secondary' }}>→</Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
)
