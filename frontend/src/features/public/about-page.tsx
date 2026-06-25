import {
  Box,
} from '@mui/material'

import { useColorMode } from '@/app/use-color-mode'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'
import { PublicPageHeader } from './components/public-page-header'
import {
  AboutCtaSection,
  AboutHeroSideCards,
  AboutOfferingsSection,
  AboutValuesSection,
} from './components/about-page-sections'
import { aboutOffers, aboutValues } from './about-page-data'

export const AboutPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'

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
        eyebrow="About Us"
        title={
          <>
            Connecting People With the{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Right Spaces
            </Box>
          </>
        }
        description="bookiblastek is a reservation platform designed to connect people with spaces that fit their needs. Whether you're organizing a meeting, hosting an event, conducting training, or looking for a workspace, our platform makes finding and reserving spaces simple and efficient."
        rightElement={<AboutHeroSideCards isLight={isLight} />}
      />

      <AboutOfferingsSection isLight={isLight} offers={aboutOffers} />

      <AboutValuesSection isLight={isLight} values={aboutValues} />

      <AboutCtaSection isLight={isLight} />

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
