import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box } from '@mui/material'

import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'
import { LandingPageIntro } from './components/landing-page-intro'
import { PublicLandingSections } from './components/public-landing-sections'
import {
  advantages,
  categories,
  steps,
  testimonials,
} from './landing-page-data'
import { useColorMode } from '@/app/use-color-mode'
import { listPublicRooms } from '@/lib/api'

export const LandingPage = () => {
  const { mode } = useColorMode()
  const isLight = mode === 'light'
  const navigate = useNavigate()
  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const featuredSpaces = useMemo(
    () =>
      [...(roomsQuery.data ?? [])]
        .sort((left, right) => {
          const ratingDelta = (right.average_rating ?? 0) - (left.average_rating ?? 0)
          if (ratingDelta !== 0) return ratingDelta
          return (right.rating_count ?? 0) - (left.rating_count ?? 0)
        })
        .slice(0, 3),
    [roomsQuery.data],
  )

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

      <LandingPageIntro
        isLight={isLight}
        navigate={(path) => navigate(path)}
      />

      <PublicLandingSections
        isLight={isLight}
        categories={categories}
        steps={steps}
        advantages={advantages}
        testimonials={testimonials}
        featuredSpaces={featuredSpaces}
        navigateToType={(spaceType) => navigate(`/book?type=${encodeURIComponent(spaceType)}`)}
      />

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
