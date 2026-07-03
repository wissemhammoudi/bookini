import { Link as RouterLink } from 'react-router-dom'
import { Avatar, alpha, Box, Button, Card, CardContent, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import StarIcon from '@mui/icons-material/Star'

import type { TestimonialCard } from '../landing-page-data'
import type { PublicRoom } from '@/lib/api'

type PublicLandingFeaturedSectionsProps = {
  isLight: boolean
  testimonials: TestimonialCard[]
  featuredSpaces: PublicRoom[]
}

export const PublicLandingFeaturedSections = ({
  isLight,
  testimonials,
  featuredSpaces,
}: PublicLandingFeaturedSectionsProps) => {
  return (
    <>
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Featured
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Top Rated Spaces
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {featuredSpaces.map((space) => (
            <Grid size={{ xs: 12, md: 4 }} key={space.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'text.primary',
                  },
                }}
              >
                <Box sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={space.cover_image || space.gallery?.[0] || `https://picsum.photos/seed/${encodeURIComponent(space.name)}/800/500`}
                    alt={space.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.55) 100%)',
                    }}
                  />
                  <Chip
                    label={`${space.price} TND/hour`}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 700,
                      bgcolor: 'rgba(15, 23, 42, 0.92)',
                      color: '#ffffff',
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {space.name}
                      </Typography>
                      {space.organization_name ? (
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {space.organization_name}
                        </Typography>
                      ) : null}
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {space.address ?? 'Tunis, Tunisia'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {space.capacity}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {(space.average_rating ?? 0).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({space.rating_count ?? 0})
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
            Testimonials
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            What Our Members Say
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {testimonials.map((test, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={`${test.author}-${idx}`}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={2}>
                  <FormatQuoteIcon sx={{ fontSize: '2.5rem', color: 'text.secondary', opacity: 0.3 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{test.text}"
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', pt: 3 }}>
                  <Avatar sx={{ bgcolor: 'text.secondary', fontWeight: 700 }}>
                    {test.author[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {test.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.role}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: 5,
            background: isLight
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #030712 0%, #0f172a 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack spacing={4} sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' } }}>
              Ready to Find Your Next Space?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              Create an account or login to start choosing from verified boardrooms, sports fields, coworking halls, and more.
            </Typography>
            <Button
              component={RouterLink}
              to="/book"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                px: 5,
                py: 2,
                borderRadius: 3,
                fontSize: '1rem',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Booking
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  )
}
