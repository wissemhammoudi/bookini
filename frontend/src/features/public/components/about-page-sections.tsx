import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'

import type { AboutOffer, AboutValue } from '../about-page-data'

type AboutHeroSideCardsProps = {
  isLight: boolean
}

export const AboutHeroSideCards = ({ isLight }: AboutHeroSideCardsProps) => {
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
              color: 'text.primary',
            }}
          >
            <FlagOutlinedIcon fontSize="medium" />
          </Box>
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Our Mission
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.6 }}>
              To simplify space reservations and help organizations maximize the use of
              their facilities.
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
              color: 'text.primary',
            }}
          >
            <VisibilityOutlinedIcon fontSize="medium" />
          </Box>
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Our Vision
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.6 }}>
              To become the leading platform for space reservation and management across
              Tunisia and beyond.
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Stack>
  )
}

type AboutOfferingsSectionProps = {
  isLight: boolean
  offers: AboutOffer[]
}

export const AboutOfferingsSection = ({ isLight, offers }: AboutOfferingsSectionProps) => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
          Offerings
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          What We Offer
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        {offers.map((offer) => (
          <Grid size={{ xs: 12, md: 4 }} key={offer.title}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'text.primary',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box>{offer.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {offer.title}
                  </Typography>
                  <Stack spacing={2}>
                    {offer.items.map((item) => (
                      <Stack key={item} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'text.primary',
                            flexShrink: 0,
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 14, fontWeight: 900 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

type AboutValuesSectionProps = {
  isLight: boolean
  values: AboutValue[]
}

export const AboutValuesSection = ({ isLight, values }: AboutValuesSectionProps) => {
  return (
    <Box
      sx={{
        py: 12,
        background: isLight
          ? 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)'
          : 'linear-gradient(180deg, #0b0f19 0%, #0f172a 100%)',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.secondary',
                }}
              >
                <EmojiObjectsOutlinedIcon />
                <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                  Core Philosophy
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                Our Values
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                We design our platform around simple principles to make space management fluid and accessible.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {values.map((value) => (
                <Grid size={{ xs: 12, sm: 6 }} key={value.title}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'divider',
                      background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                      height: '100%',
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{value.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {value.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

type AboutCtaSectionProps = {
  isLight: boolean
}

export const AboutCtaSection = ({ isLight }: AboutCtaSectionProps) => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
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
        }}
      >
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Join bookiwa7dek Today
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400 }}>
            Simplify how your organization syncs resources, bookings, and operations.
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
              '&:hover': {
                bgcolor: alpha('#ffffff', 0.9),
                transform: 'translateY(-2px)',
              },
            }}
          >
            Get Started
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
