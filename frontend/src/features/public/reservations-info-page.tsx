import { useState } from 'react'
import {
  Box,
} from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'
import { PublicPageHeader } from './components/public-page-header'
import {
  ReservationsCtaSection,
  ReservationsFaqSection,
  ReservationsRolesSection,
  ReservationsStepTimeline,
} from './components/reservations-info-sections'
import { reservationFaqs, reservationRoles, reservationSteps } from './reservations-info-data'

export const ReservationsInfoPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [expanded, setExpanded] = useState<string | false>(false)
  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
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
        eyebrow="User Guide"
        title="How It Works"
        description="Getting your space booked is a simple, seamless process. Follow our easy guide to get started."
        rightElement={
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 16px 40px -12px rgba(0,0,0,0.1)',
              position: 'relative',
              width: '100%',
              pt: '75%', // 4:3 aspect ratio
              background: isLight
                ? 'linear-gradient(135deg, #f1f5f9, #ffffff)'
                : 'linear-gradient(135deg, #1f2937, #374151)',
            }}
          >
            <Box
              component="img"
              src="/how-it-works.svg"
              alt="Booking process visualization"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        }
      />

      <ReservationsStepTimeline isLight={isLight} steps={reservationSteps} />

      <ReservationsRolesSection isLight={isLight} roles={reservationRoles} />

      <ReservationsFaqSection
        isLight={isLight}
        faqs={reservationFaqs}
        expanded={expanded}
        onChange={handleAccordionChange}
      />

      <ReservationsCtaSection isLight={isLight} />

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
