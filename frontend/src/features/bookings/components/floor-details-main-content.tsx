import { Box, Button, Container, Stack } from '@mui/material'

import type { FloorReviewsResponse, PublicFloor } from '@/lib/api'
import { FloorDetailsActivitySections } from './floor-details-activity-sections'
import { FloorDetailsHeroSection } from './floor-details-hero-section'
import type { BookingType } from '../floor-details-utils'

export const FloorDetailsMainContent = ({
  floor,
  isLight,
  effectiveDisplayPrice,
  bookingType,
  images,
  bookingError,
  selectedCalendarDate,
  reservedByDate,
  dayCells,
  monthLabel,
  floorRating,
  floorComment,
  floorReviewsPage,
  floorReviewsMinFilter,
  floorReviewsQuery,
  floorReviewsIsError,
  canGoNextFloorReviews,
  onBackToPlace,
  onBookingTypeChange,
  onPreviousMonth,
  onNextMonth,
  onCalendarDateClick,
  onFloorRatingChange,
  onFloorCommentChange,
  onSaveRating,
  onDeleteRating,
  onFloorReviewsPageChange,
  onFloorReviewsMinFilterChange,
}: {
  floor: PublicFloor
  isLight: boolean
  effectiveDisplayPrice: number
  bookingType: BookingType
  images: string[]
  bookingError: string | null
  selectedCalendarDate: string | null
  reservedByDate: Record<string, Array<{ start: string; end: string; status: string }>>
  dayCells: Array<Date | null>
  monthLabel: string
  floorRating: number
  floorComment: string
  floorReviewsPage: number
  floorReviewsMinFilter: number
  floorReviewsQuery: FloorReviewsResponse | undefined
  floorReviewsIsError: boolean
  canGoNextFloorReviews: boolean
  onBackToPlace: () => void
  onBookingTypeChange: (next: BookingType) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onCalendarDateClick: (date: Date) => void
  onFloorRatingChange: (value: number) => void
  onFloorCommentChange: (value: string) => void
  onSaveRating: () => void
  onDeleteRating: () => void
  onFloorReviewsPageChange: (value: number) => void
  onFloorReviewsMinFilterChange: (value: number) => void
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isLight
          ? 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #eef2ff 100%)'
          : 'linear-gradient(180deg, #0a0e1a 0%, #101d32 45%, #1a1f3a 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={4}>
          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start' }}>
            <Button variant="outlined" onClick={onBackToPlace}>
              Back to place
            </Button>
          </Stack>

          <FloorDetailsHeroSection
            isLight={isLight}
            floor={floor}
            effectiveDisplayPrice={effectiveDisplayPrice}
            bookingType={bookingType}
            images={images}
            onBookingTypeChange={onBookingTypeChange}
          />

          <FloorDetailsActivitySections
            isLight={isLight}
            floor={floor}
            bookingError={bookingError}
            selectedCalendarDate={selectedCalendarDate}
            reservedByDate={reservedByDate}
            dayCells={dayCells}
            monthLabel={monthLabel}
            floorRating={floorRating}
            floorComment={floorComment}
            floorReviewsPage={floorReviewsPage}
            floorReviewsMinFilter={floorReviewsMinFilter}
            floorReviewsQuery={floorReviewsQuery}
            floorReviewsIsError={floorReviewsIsError}
            canGoNextFloorReviews={canGoNextFloorReviews}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
            onCalendarDateClick={onCalendarDateClick}
            onFloorRatingChange={onFloorRatingChange}
            onFloorCommentChange={onFloorCommentChange}
            onSaveRating={onSaveRating}
            onDeleteRating={onDeleteRating}
            onFloorReviewsPageChange={onFloorReviewsPageChange}
            onFloorReviewsMinFilterChange={onFloorReviewsMinFilterChange}
          />
        </Stack>
      </Container>
    </Box>
  )
}
