import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  alpha,
  InputAdornment,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SendIcon from '@mui/icons-material/Send'

import { useColorMode } from '@/app/use-color-mode'

export const ContactPage = () => {
  const navigate = useNavigate()
  const { mode, toggleMode } = useColorMode()
  const isLight = mode === 'light'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const mailtoSubject = encodeURIComponent(subject || `bookiwa7dek contact from ${name || 'visitor'}`)
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nSubject: ${subject}\n\n${message}`,
    )
    window.location.href = `mailto:contact@bookiwa7dek.com?subject=${mailtoSubject}&body=${mailtoBody}`
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha(isLight ? '#ffffff' : '#0f1419', isLight ? 0.82 : 0.85),
          backdropFilter: 'blur(18px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/')}
                color="inherit"
                sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Contact Us
              </Typography>
            </Stack>

            <IconButton
              onClick={toggleMode}
              color="inherit"
              sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(4px)' }}
            >
              {isLight ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          {/* Left Section - Contact Info */}
          <Box>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                  Get in touch
                </Typography>
                <Typography color="text.secondary" variant="h6" sx={{ mt: 2 }}>
                  Have questions about bookiwa7dek? We'd love to hear from you. Reach out anytime.
                </Typography>
              </Box>

              <Stack spacing={2}>
                {[
                  {
                    icon: EmailIcon,
                    label: 'Email',
                    value: 'contact@bookiwa7dek.com',
                    detail: 'We respond within 24 hours',
                  },
                  {
                    icon: PhoneIcon,
                    label: 'Phone',
                    value: '+216 00 000 000',
                    detail: 'Mon-Fri 9:00 AM - 5:00 PM',
                  },
                  {
                    icon: LocationOnIcon,
                    label: 'Office',
                    value: 'Tunis, Tunisia',
                    detail: 'Visit us for a demo',
                  },
                ].map(({ icon: Icon, label, value, detail }) => (
                  <Paper
                    key={label}
                    elevation={0}
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 3,
                      background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha('#1976d2', 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {detail}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Right Section - Contact Form */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                background: isLight
                  ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                  : `linear-gradient(135deg, ${alpha('#101d32', 0.8)} 0%, ${alpha('#0a0e1a', 0.9)} 100%)`,
              }}
            >
              <Box component="form" onSubmit={handleContactSubmit}>
                <Stack spacing={3}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Send us a message
                  </Typography>

                  {submitted && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      Thank you for your message! We'll get back to you soon.
                    </Alert>
                  )}

                  <TextField
                    label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    slotProps={{
                      input: {
                        sx: {
                          background: isLight ? '#fafbfc' : alpha('#0a0e1a', 0.5),
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        sx: {
                          background: isLight ? '#fafbfc' : alpha('#0a0e1a', 0.5),
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        sx: {
                          background: isLight ? '#fafbfc' : alpha('#0a0e1a', 0.5),
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Message"
                    multiline
                    minRows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    fullWidth
                    placeholder="Tell us how we can help..."
                    slotProps={{
                      input: {
                        sx: {
                          background: isLight ? '#fafbfc' : alpha('#0a0e1a', 0.5),
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0, 89, 179, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0, 89, 179, 0.3)',
                      },
                    }}
                  >
                    Send message
                  </Button>

                  <Typography variant="body2" color="text.secondary" align="center">
                    We typically respond within 24 hours during business days.
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
