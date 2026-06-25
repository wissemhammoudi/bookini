import { alpha, Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material'

import type { AdvantageCard, CategoryCard, StepCard } from '../landing-page-data'

type PublicLandingCoreSectionsProps = {
  isLight: boolean
  categories: CategoryCard[]
  steps: StepCard[]
  advantages: AdvantageCard[]
  navigateToType: (spaceType: string) => void
}

export const PublicLandingCoreSections = ({
  isLight,
  categories,
  steps,
  advantages,
  navigateToType,
}: PublicLandingCoreSectionsProps) => {
  return (
    <>
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Popular Categories
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Find the Perfect Setting
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'text.primary',
                  },
                }}
                onClick={() => navigateToType(cat.title)}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ mb: 2 }}>{cat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {cat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {cat.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          py: 12,
          background: isLight
            ? 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
            : 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 12,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
              Process
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              How It Works
            </Typography>
          </Stack>
          <Grid container spacing={4}>
            {steps.map((step) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`${step.num}-${step.title}`}>
                <Box sx={{ position: 'relative', textAlign: 'center', p: 2 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: '4.5rem',
                      fontWeight: 900,
                      opacity: 0.05,
                      color: 'text.primary',
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  >
                    {step.num}
                  </Typography>
                  <Stack spacing={1} sx={{ zIndex: 2, position: 'relative' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, mx: 'auto', lineHeight: 1.6 }}>
                      {step.desc}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                Benefits
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                Why Choose bookiblastek
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, pt: 1 }}>
                We provide a professional and unified interface designed to handle reservations of diverse spaces quickly. Get full transparency, absolute reliability, and zero friction.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={3}>
              {advantages.map((adv) => (
                <Grid size={{ xs: 12, sm: 6 }} key={adv.title}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: 'text.primary',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{adv.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      {adv.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {adv.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
