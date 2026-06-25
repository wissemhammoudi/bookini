import { Link as RouterLink } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HelpIcon from '@mui/icons-material/Help'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import type { ReservationFaq, ReservationRole, ReservationStep } from '../reservations-info-data'

type ReservationsStepTimelineProps = {
  isLight: boolean
  steps: ReservationStep[]
}

export const ReservationsStepTimeline = ({ isLight, steps }: ReservationsStepTimelineProps) => {
  return (
    <Container maxWidth="lg" sx={{ mb: 12 }}>
      <Grid container spacing={3}>
        {steps.map((step) => (
          <Grid size={{ xs: 12, md: 2.4 }} key={step.title}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'text.primary',
                },
              }}
            >
              <Box sx={{ height: 6, bgcolor: step.color }} />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'text.primary',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                      }}
                    >
                      {step.step}
                    </Typography>
                  </Stack>

                  <Typography variant="h6" sx={{ fontWeight: 850 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {step.desc}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

type ReservationsRolesSectionProps = {
  isLight: boolean
  roles: ReservationRole[]
}

export const ReservationsRolesSection = ({ isLight, roles }: ReservationsRolesSectionProps) => {
  return (
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
            Access Controls
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            User Roles & Permissions
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            We maintain role-based boundaries to ensure clear workflows and secure setups.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {roles.map((role) => (
            <Grid size={{ xs: 12, md: 4 }} key={role.role}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: isLight ? '#ffffff' : alpha('#1f2937', 0.5),
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                      color: 'text.primary',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Stack spacing={1}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {role.role}
                    </Typography>
                    <Chip
                      label={role.badge}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'text.primary',
                      }}
                    />
                  </Stack>

                  <Stack spacing={1.5} sx={{ alignSelf: 'stretch', textAlign: 'left', pt: 2 }}>
                    {role.manages.map((item) => (
                      <Stack key={item} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

type ReservationsFaqSectionProps = {
  isLight: boolean
  faqs: ReservationFaq[]
  expanded: string | false
  onChange: (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => void
}

export const ReservationsFaqSection = ({
  isLight,
  faqs,
  expanded,
  onChange,
}: ReservationsFaqSectionProps) => {
  return (
    <Container maxWidth="md" sx={{ mb: 12 }}>
      <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
        <HelpIcon sx={{ fontSize: '3rem', color: 'text.secondary', mx: 'auto', opacity: 0.8 }} />
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          Frequently Asked Questions
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            elevation={0}
            expanded={expanded === faq.id}
            onChange={onChange(faq.id)}
            sx={{
              borderRadius: '12px !important',
              border: '1px solid',
              borderColor: 'divider',
              background: isLight ? '#ffffff' : alpha('#1f2937', 0.4),
              mb: 1,
              '&::before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
              sx={{ px: 3, py: 1 }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Container>
  )
}

type ReservationsCtaSectionProps = {
  isLight: boolean
}

export const ReservationsCtaSection = ({ isLight }: ReservationsCtaSectionProps) => {
  return (
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
        }}
      >
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            Reserve Your First Space Now
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400 }}>
            Choose a time, date, and space type to coordinate your next workshop, sync, or match.
          </Typography>
          <Button
            component={RouterLink}
            to="/book"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
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
            Start Booking
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
