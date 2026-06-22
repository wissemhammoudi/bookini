import { Box, Button, Container, Stack, Tabs, Tab, Paper, TextField, Typography, alpha, Alert } from '@mui/material'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'

/**
 * Contact Page
 * Dual-tab page for contact inquiries and partnership requests
 * - Tab 1: General contact form
 * - Tab 2: Partnership request form
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
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
        py: { xs: 6, md: 10 },
      }}
    >
      <PublicNavbar isLight={isLight} />
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
              Get in Touch
            </Typography>
            <Typography color="text.secondary">
              Have questions? We'd love to hear from you.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              background: isLight ? '#ffffff' : alpha('#0a0e1a', 0.5),
            }}
          >
            <Tabs
              value={tab}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid',
                borderColor: isLight ? 'rgba(0, 89, 179, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                px: 2,
              }}
            >
              <Tab label="Contact Us" sx={{ fontWeight: 700 }} />
              <Tab label="Become Partner" sx={{ fontWeight: 700 }} />
            </Tabs>

            <form onSubmit={handleSubmit}>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  {submitted && (
                    <Alert severity="success">
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

                  {tab === 0 ? (
                    <TextField
                      label="Message"
                      multiline
                      minRows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="Tell us what you'd like to discuss..."
                    />
                  ) : (
                    <>
                      <TextField
                        label="Message"
                        multiline
                        minRows={4}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        fullWidth
                        required
                        size="small"
                        placeholder="Tell us about your business and why you'd like to partner with us..."
                      />
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{ fontWeight: 700, py: 1 }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </Box>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
