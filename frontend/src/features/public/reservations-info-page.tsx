import { Box, Container, List, ListItem, ListItemIcon, ListItemText, Stack, Typography, alpha } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'

/**
 * Reservations Info Page
 * Explains the booking process and features to users
 */
export const ReservationsInfoPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const steps = [
    {
      title: 'Choose a Plan',
      description: 'Select a subscription plan that fits your needs - Pay-As-You-Go, Starter, or Professional.',
    },
    {
      title: 'Browse Rooms',
      description: 'Browse our available rooms and spaces with detailed amenities and pricing information.',
    },
    {
      title: 'Make a Booking',
      description: 'Select your preferred room, date, and time. Fill in your details and confirm your booking.',
    },
    {
      title: 'Get Confirmation',
      description: 'Receive instant confirmation with your booking reference and calendar invite.',
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Stack spacing={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                How It Works
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Booking a room with bookiwa7dek is simple and straightforward
              </Typography>
            </Box>

            <List
              sx={{
                background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                border: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                p: 3,
              }}
            >
              {steps.map((step, idx) => (
                <ListItem key={idx} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background: `linear-gradient(135deg, rgb(0, 89, 179) 0%, rgb(0, 120, 215) 100%)`,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                      }}
                    >
                      {idx + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 700 }}>{step.title}</Typography>}
                    secondary={step.description}
                  />
                </ListItem>
              ))}
            </List>

            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Why Choose bookiwa7dek?
              </Typography>
              <Stack spacing={1.5}>
                {[
                  '⚡ Instant booking confirmation',
                  '📅 Calendar integration (iCalendar)',
                  '💰 Flexible subscription plans',
                  '🏢 Multiple premium rooms',
                  '📧 Email confirmations',
                  '🛟 24/7 customer support',
                ].map((feature, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                    <Typography>{feature}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
