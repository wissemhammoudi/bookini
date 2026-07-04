import { Box, Container, Divider, Link as MuiLink, Stack, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import { Link as RouterLink } from 'react-router-dom'

interface PublicFooterProps {
  isLight: boolean
}

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Book Space', to: '/book' },
  { label: 'How It Works', to: '/reservations-info' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const PublicFooter = ({ isLight }: PublicFooterProps) => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: '1px solid',
        borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        background: isLight
          ? 'linear-gradient(180deg, rgba(248, 250, 252, 0.65) 0%, #ffffff 100%)'
          : 'linear-gradient(180deg, rgba(15, 20, 25, 0.4) 0%, rgba(10, 14, 26, 0.98) 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={4}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ justifyContent: 'space-between' }}>
            <Stack spacing={2} sx={{ maxWidth: 420 }}>
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <Box
                  component="img"
                  src="/navbar_logo.png"
                  alt="Bookini Logo"
                  sx={{
                    height: 40,
                    width: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Discover and book meeting rooms, event spaces, and professional venues with a clean,
                trusted reservation experience.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ flexWrap: 'wrap' }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.06em' }} color="text.secondary">
                  Quick Links
                </Typography>
                {quickLinks.map((link) => (
                  <MuiLink
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    underline="none"
                    color="text.primary"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontWeight: 600 }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>

              <Stack spacing={1.5} sx={{ minWidth: 240 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.06em' }} color="text.secondary">
                  Contact
                </Typography>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Tunis, Tunisia
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    +216 71 123 456
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <EmailOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    support@bookiwa7dek.com
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.08)' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              © 2026 Bookini. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built for trusted bookings, reviews, and professional space discovery.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
