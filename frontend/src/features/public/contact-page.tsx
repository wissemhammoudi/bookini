import { Box, Button, Container, Stack, Tabs, Tab, Paper, TextField, Typography, alpha, Alert, Grid, Avatar } from '@mui/material'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import SendIcon from '@mui/icons-material/Send'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'
import { PublicPageHeader } from './components/public-page-header'
import { createContactRequest, createPartnershipRequest } from '@/lib/api'

/**
 * Contact Page
 * Redesigned with minimalistic colors and professional slate/grey accents.
 */
export const ContactPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const [tab, setTab] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    floors: '1',
    expectedUsers: '10',
  })
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const contactMutation = useMutation({ mutationFn: createContactRequest })
  const partnershipMutation = useMutation({ mutationFn: createPartnershipRequest })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      floors: '1',
      expectedUsers: '10',
    })
    setSubmittedMessage(null)
    setSubmitError(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isSubmitting = tab === 0 ? contactMutation.isPending : partnershipMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedMessage(null)
    setSubmitError(null)

    try {
      if (tab === 0) {
        await contactMutation.mutateAsync({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject || 'General inquiry',
          message: formData.message,
        })
        setSubmittedMessage('Thank you! Your contact request was submitted successfully.')
      } else {
        await partnershipMutation.mutateAsync({
          company_name: formData.name,
          contact_person: formData.contactPerson || formData.name,
          contact_email: formData.email,
          contact_phone: formData.phone,
          number_of_floors: Number.parseInt(formData.floors, 10) || 1,
          expected_users: Number.parseInt(formData.expectedUsers, 10) || 1,
          description: formData.message,
        })
        setSubmittedMessage('Partnership request sent. Our team will contact you shortly.')
      }

      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        floors: '1',
        expectedUsers: '10',
      })
    } catch {
      setSubmitError('Could not submit the form right now. Please try again in a moment.')
    }
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

      <PublicPageHeader
        isLight={isLight}
        eyebrow="Contact"
        title={
          <>
            Have Questions or{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Partnership Requests?
            </Box>
          </>
        }
        description="Contact our team and we will help you with reservations, onboarding, or business collaboration."
      />

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
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
                        {submittedMessage ? (
                          <Alert severity="success" sx={{ borderRadius: 2 }}>
                            {submittedMessage}
                          </Alert>
                        ) : null}

                        {submitError ? (
                          <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {submitError}
                          </Alert>
                        ) : null}

                        <TextField
                          label={tab === 0 ? 'Full Name' : 'Company Name'}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />

                        {tab === 1 ? (
                          <TextField
                            label="Contact Person"
                            value={formData.contactPerson}
                            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                            fullWidth
                            required
                            size="small"
                          />
                        ) : null}

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
                          label="Phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />

                        {tab === 0 ? (
                          <TextField
                            label="Subject"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            fullWidth
                            required
                            size="small"
                          />
                        ) : null}

                        {tab === 1 ? (
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              label="Number of Floors"
                              type="number"
                              value={formData.floors}
                              onChange={(e) => handleInputChange('floors', e.target.value)}
                              fullWidth
                              required
                              size="small"
                              slotProps={{ htmlInput: { min: 1 } }}
                            />
                            <TextField
                              label="Expected Users"
                              type="number"
                              value={formData.expectedUsers}
                              onChange={(e) => handleInputChange('expectedUsers', e.target.value)}
                              fullWidth
                              required
                              size="small"
                              slotProps={{ htmlInput: { min: 1 } }}
                            />
                          </Stack>
                        ) : null}

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
                          disabled={isSubmitting}
                          sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
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

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
