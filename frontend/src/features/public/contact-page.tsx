import { Box, Button, Container, Stack, Tabs, Tab, Paper, TextField, Typography, alpha, Alert, Grid, Avatar } from '@mui/material'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'

/**
 * Contact Page
 * Redesigned with minimalistic colors and professional slate/grey accents.
 */
export const ContactPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const [tab, setTab] = useState(0)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setFormData({ name: '', email: '', message: '' })
    setSubmitted(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', { tab, ...formData })
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f1f5f9 100%)'
          : 'linear-gradient(180deg, #0b0f19 0%, #111827 45%, #0f172a 100%)',
      }}
    >
      <PublicNavbar isLight={isLight} />
      
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                Get in Touch
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Have questions or partnership requests? We'd love to hear from you.
              </Typography>
            </Box>

            <Grid container spacing={5} sx={{ alignItems: 'flex-start' }}>
              {/* Contact Information (Left Column) */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                      Contact Information
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Reach out directly or send us a message through the form. Our support team is ready to assist you.
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Phone */}
                    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                          color: 'text.primary',
                          width: 52,
                          height: 52,
                          boxShadow: 'none',
                        }}
                      >
                        <PhoneIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>
                          PHONE NUMBER
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          +216 71 123 456
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Email */}
                    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                          color: 'text.primary',
                          width: 52,
                          height: 52,
                          boxShadow: 'none',
                        }}
                      >
                        <EmailIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>
                          EMAIL ADDRESS
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          support@bookiwa7dek.com
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Location */}
                    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                          color: 'text.primary',
                          width: 52,
                          height: 52,
                          boxShadow: 'none',
                        }}
                      >
                        <LocationOnIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>
                          OFFICE LOCATION
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          123 Rue de la Liberté, Tunis, Tunisia
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Message Form (Right Column) */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                    boxShadow: 'none',
                  }}
                >
                  <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      px: 2,
                    }}
                  >
                    <Tab label="Contact Us" sx={{ fontWeight: 700 }} />
                    <Tab label="Become Partner" sx={{ fontWeight: 700 }} />
                  </Tabs>

                  <form onSubmit={handleSubmit}>
                    <Box sx={{ p: 4 }}>
                      <Stack spacing={2.5}>
                        {submitted && (
                          <Alert severity="success" sx={{ borderRadius: 2 }}>
                            Thank you! We'll get back to you soon.
                          </Alert>
                        )}

                        <TextField
                          label={tab === 0 ? 'Full Name' : 'Company Name'}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />

                        <TextField
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />

                        <TextField
                          label="Message"
                          multiline
                          minRows={tab === 0 ? 5 : 4}
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          fullWidth
                          required
                          size="small"
                          placeholder={
                            tab === 0
                              ? "Tell us what you'd like to discuss..."
                              : "Tell us about your business and why you'd like to partner with us..."
                          }
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          endIcon={<SendIcon />}
                          sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
                        >
                          Send Message
                        </Button>
                      </Stack>
                    </Box>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
