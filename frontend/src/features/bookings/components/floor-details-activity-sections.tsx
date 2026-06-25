import type { PublicFloor, FloorReviewsResponse } from '@/lib/api'
import { FloorDetailsCalendarSection } from './floor-details-calendar-section'
import { FloorDetailsReviewsSection } from './floor-details-reviews-section'

type FloorDetailsActivitySectionsProps = {
  isLight: boolean
  floor: PublicFloor
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
  onPreviousMonth: () => void
  onNextMonth: () => void
  onCalendarDateClick: (date: Date) => void
  onFloorRatingChange: (value: number) => void
  onFloorCommentChange: (value: string) => void
  onSaveRating: () => void
  onDeleteRating: () => void
  onFloorReviewsPageChange: (next: number) => void
  onFloorReviewsMinFilterChange: (value: number) => void
}

export const FloorDetailsActivitySections = ({
  isLight,
  floor,
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
  onPreviousMonth,
  onNextMonth,
  onCalendarDateClick,
  onFloorRatingChange,
  onFloorCommentChange,
  onSaveRating,
  onDeleteRating,
  onFloorReviewsPageChange,
  onFloorReviewsMinFilterChange,
}: FloorDetailsActivitySectionsProps) => {
  return (
    <>
      <FloorDetailsCalendarSection
        isLight={isLight}
        floor={floor}
        bookingError={bookingError}
        selectedCalendarDate={selectedCalendarDate}
        reservedByDate={reservedByDate}
        dayCells={dayCells}
        monthLabel={monthLabel}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onCalendarDateClick={onCalendarDateClick}
      />

      <FloorDetailsReviewsSection
        isLight={isLight}
        floorRating={floorRating}
        floorComment={floorComment}
        floorReviewsPage={floorReviewsPage}
        floorReviewsMinFilter={floorReviewsMinFilter}
        floorReviewsQuery={floorReviewsQuery}
        floorReviewsIsError={floorReviewsIsError}
        canGoNextFloorReviews={canGoNextFloorReviews}
        onFloorRatingChange={onFloorRatingChange}
        onFloorCommentChange={onFloorCommentChange}
        onSaveRating={onSaveRating}
        onDeleteRating={onDeleteRating}
        onFloorReviewsPageChange={onFloorReviewsPageChange}
        onFloorReviewsMinFilterChange={onFloorReviewsMinFilterChange}
      />
    </>
  )
}
