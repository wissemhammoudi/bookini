import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  alpha,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'

import { useAuth } from '@/features/auth/use-auth'

const featureCards = [
  {
    icon: EventAvailableOutlinedIcon,
    title: 'Smart reservations',
    description:
      'Book rooms, track capacity, and keep every reservation aligned with live availability.',
  },
  {
    icon: BarChartOutlinedIcon,
    title: 'Visibility and analytics',
    description:
      'See occupancy, reservation trends, and performance insights from a single dashboard.',
  },
  {
    icon: GroupsOutlinedIcon,
    title: 'Teams and roles',
    description:
      'Manage users, admins, and super admins with clear permissions and a simple workflow.',
  },
]

export const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const subject = encodeURIComponent(`Bookini contact from ${name || 'visitor'}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    )
    window.location.href = `mailto:contact@bookini.com?subject=${subject}&body=${body}`
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha('#ffffff', 0.82),
          backdropFilter: 'blur(18px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Bookini
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Smart floor reservation platform
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Button href="#about" color="inherit">
                About
              </Button>
              <Button href="#features" color="inherit">
                Features
              </Button>
              <Button href="#contact" color="inherit">
                Contact us
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {isAuthenticated ? (
                <Button component={RouterLink} to="/dashboard" variant="contained">
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" variant="outlined">
                    Sign in
                  </Button>
                  <Button component={RouterLink} to="/register" variant="contained">
                    Register
                  </Button>
                </>
              )}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Box>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: '0.22em',
                  color: 'primary.main',
                  fontWeight: 700,
                }}
              >
                Bookini workspace platform
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.04 }}
              >
                Describe your company, manage rooms, and keep teams in sync.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
                Bookini helps organizations publish a clean company interface, present services,
                support contact requests, and run reservations with clear roles for users, admins,
                and super admins.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" size="large">
                  Create an account
                </Button>
                <Button href="#contact" variant="outlined" size="large">
                  Contact us
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                {[
                  ['Live occupancy', 'Monitor room usage in real time.'],
                  ['Simple onboarding', 'Login and register are always in the navbar.'],
                  ['Company profile', 'Public-facing sections explain who you are and what you do.'],
                ].map(([title, detail]) => (
                  <Paper
                    key={title}
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detail}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 24px 80px rgba(15, 23, 42, 0.10)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                  About Bookini
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Everything your company needs in one clean public interface.
                </Typography>
                <Typography color="text.secondary">
                  Present your company, explain your services, highlight your team, and offer a
                  direct way for visitors to reach you.
                </Typography>
                <Divider />
                <Stack spacing={1.5}>
                  {[
                    'Office floor reservation and admin workflows',
                    'Smart dashboards for occupancy and activity',
                    'Public contact section for new requests',
                  ].map((item) => (
                    <Stack key={item} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                      <Typography>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Box>

        <Box id="about" sx={{ pt: { xs: 8, md: 12 } }}>
          <Stack spacing={1.5} sx={{ mb: 3, maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
              Company overview
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Build a polished company story and keep operations organized.
            </Typography>
            <Typography color="text.secondary">
              This front-end can act as a public home for your company while still supporting the
              internal reservation system, admin management, and reporting tools behind login.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.title}
                  elevation={0}
                  sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha('#1976d2', 0.1),
                          color: 'primary.main',
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {card.title}
                      </Typography>
                      <Typography color="text.secondary">{card.description}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        </Box>

        <Box id="features" sx={{ pt: { xs: 8, md: 12 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1} sx={{ maxWidth: 760 }}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                  Why teams use Bookini
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  A structured experience for visitors, users, admins, and operations.
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {[
                  ['Public landing page', 'Tell visitors what the company does before they log in.'],
                  ['Fast sign in/register', 'Always visible actions in the navbar.'],
                  ['Contact section', 'A dedicated way to reach the company team.'],
                ].map(([title, detail]) => (
                  <Paper
                    variant="outlined"
                    key={title}
                    sx={{ p: 2.5, borderRadius: 3, height: '100%', bgcolor: '#fff' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detail}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box id="contact" sx={{ pt: { xs: 8, md: 12 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
              gap: 3,
              alignItems: 'stretch',
            }}
          >
            <Box>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                  Contact us
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Talk to the Bookini team.
                </Typography>
                <Typography color="text.secondary">
                  For company inquiries, demos, or support, use the form or reach us directly.
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {[
                  ['Email', 'contact@bookini.com'],
                  ['Phone', '+216 00 000 000'],
                  ['Office', 'Tunis, Tunisia'],
                ].map(([label, value]) => (
                  <Paper
                    key={label}
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {label}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box component="form" onSubmit={handleContactSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Your name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Message"
                      multiline
                      minRows={5}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      fullWidth
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button type="submit" variant="contained" size="large">
                        Send message
                      </Button>
                      <Button component={RouterLink} to="/register" variant="outlined" size="large">
                        Register instead
                      </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Need a quick answer? The login and register buttons stay available in the
                      navbar at the top.
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography color="text.secondary">
              © 2026 Bookini. Reservation interface, company overview, and contact area.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button href="#about" color="inherit">
                About
              </Button>
              <Button href="#contact" color="inherit">
                Contact us
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
