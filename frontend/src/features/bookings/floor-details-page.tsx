import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Box,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { FloorDetailsMainContent } from './components/floor-details-main-content'
import { FloorAreaDetailsDialog } from './components/floor-area-details-dialog'
import {
  FloorDetailsPageLoading,
  FloorDetailsPageNotFound,
} from './components/floor-details-page-states'
import {
  buildCalendarDayCells,
  groupReservedByDate,
  parseFloorRoomPreviews,
  toIsoDate,
} from './floor-details-utils'
import type { BookingType, FloorRoomPreview } from './floor-details-utils'
import {
  listPublicBookingCalendarSlots,
  listPublicRooms,
  deleteMyFloorReview,
  listFloorReviews,
  upsertMyFloorReview,
} from '@/lib/api'
import { resolveMediaUrl } from './media-utils'

export const FloorDetailsPage = () => {
  const navigate = useNavigate()
  const { roomId = '', floorId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingType, setBookingType] = useState<BookingType>('WHOLE_FLOOR')
  const [selectedAreaKeys, setSelectedAreaKeys] = useState<string[]>([])
  const [selectedAreaDetails, setSelectedAreaDetails] = useState<FloorRoomPreview | null>(null)

  const [floorRating, setFloorRating] = useState(5)
  const [floorComment, setFloorComment] = useState('')
  const [floorReviewsPage, setFloorReviewsPage] = useState(0)
  const [floorReviewsMinFilter, setFloorReviewsMinFilter] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  const roomsQuery = useQuery({
    queryKey: ['public-rooms-catalog'],
    queryFn: listPublicRooms,
  })

  const room = useMemo(() => {
    return (roomsQuery.data ?? []).find((item) => item.id === Number.parseInt(roomId, 10)) ?? null
  }, [roomsQuery.data, roomId])

  const floor = useMemo(() => {
    if (!room?.floors) return null
    return room.floors.find((f) => f.id === floorId) ?? null
  }, [room, floorId])

  const floorPrice = floor?.price ?? room?.price ?? 0
  const floorRoomPreviews = useMemo(
    () => parseFloorRoomPreviews(floor?.blueprint_image, floor?.reservation_areas, floorPrice),
    [floor?.blueprint_image, floor?.reservation_areas, floorPrice],
  )
  const areaOptions = useMemo(
    () => floorRoomPreviews.map((item) => ({
      key: item.name,
      label: item.name,
      price: item.price,
      includes: item.includes,
      capacity: floor?.capacity,
    })),
    [floorRoomPreviews, floor?.capacity],
  )
  const resolvedSelectedAreaKeys = useMemo(
    () => selectedAreaKeys.filter((key) => areaOptions.some((option) => option.key === key)),
    [selectedAreaKeys, areaOptions],
  )
  const selectedAreaOptions = useMemo(
    () => areaOptions.filter((option) => resolvedSelectedAreaKeys.includes(option.key)),
    [areaOptions, resolvedSelectedAreaKeys],
  )
  const selectedAreasHourlyRate = selectedAreaOptions.reduce((sum, option) => sum + option.price, 0)
  const effectiveDisplayPrice = bookingType === 'SELECTED_AREAS' && selectedAreaOptions.length > 0
    ? selectedAreasHourlyRate
    : floorPrice

  const images = useMemo(() => {
    if (!room) return []
    const list = [floor?.blueprint_image, room.cover_image, ...(room.gallery ?? [])]
      .filter((item): item is string => typeof item === 'string' && !item.startsWith('['))
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean)
      .slice(0, 3)
    return list.length > 0 ? list : ['/navbar_logo.png']
  }, [room, floor])

  const floorReviewsLimit = 5

  const floorReviewsQuery = useQuery({
    queryKey: ['floor-reviews', floorId, floorReviewsPage, floorReviewsMinFilter],
    queryFn: () =>
      listFloorReviews(floorId, {
        limit: floorReviewsLimit,
        offset: floorReviewsPage * floorReviewsLimit,
        min_rating: floorReviewsMinFilter > 0 ? floorReviewsMinFilter : undefined,
      }),
    enabled: Boolean(floorId),
  })

  const upsertFloorReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      upsertMyFloorReview(floorId, payload),
    onSuccess: async () => {
      await floorReviewsQuery.refetch()
      setFloorComment('')
      setFloorRating(5)
    },
  })

  const deleteFloorReviewMutation = useMutation({
    mutationFn: () => deleteMyFloorReview(floorId),
    onSuccess: async () => {
      await floorReviewsQuery.refetch()
    },
  })

  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const calendarEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)

  const calendarSlotsQuery = useQuery({
    queryKey: [
      'public-booking-calendar-slots',
      room?.id,
      toIsoDate(calendarStart),
      toIsoDate(calendarEnd),
    ],
    queryFn: () =>
      listPublicBookingCalendarSlots({
        room_id: room!.id,
        start_date: toIsoDate(calendarStart),
        end_date: toIsoDate(calendarEnd),
      }),
    enabled: Boolean(room),
  })

  const reservedByDate = groupReservedByDate(calendarSlotsQuery.data ?? [])

  const monthLabel = calendarMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const dayCells = buildCalendarDayCells(calendarMonth, calendarStart, calendarEnd)

  const handleCalendarDateClick = (date: Date) => {
    if (!room || !floor) return

    const iso = toIsoDate(date)
    const hasReservations = (reservedByDate[iso] ?? []).length > 0
    if (hasReservations) {
      setBookingError('This date is already reserved and cannot be booked. Please choose another date.')
      return
    }

    if (bookingType === 'SELECTED_AREAS' && resolvedSelectedAreaKeys.length === 0) {
      setBookingError('Select one or more areas from this floor before opening the booking form.')
      return
    }

    setSelectedCalendarDate(iso)
    setBookingError(null)

    const params = new URLSearchParams()
    params.set('date', iso)
    params.set('type', bookingType)
    if (bookingType === 'SELECTED_AREAS' && resolvedSelectedAreaKeys.length > 0) {
      params.set('areas', resolvedSelectedAreaKeys.join(','))
    }

    navigate(`/book/place/${room.id}/floor/${floor.id}/reserve?${params.toString()}`)
  }

  if (roomsQuery.isLoading) {
    return <FloorDetailsPageLoading isLight={isLight} />
  }

  if (!room || !floor) {
    return <FloorDetailsPageNotFound isLight={isLight} onBackToSpaces={() => navigate('/book')} />
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <PublicNavbar isLight={isLight} />

      <FloorDetailsMainContent
        floor={floor}
        isLight={isLight}
        effectiveDisplayPrice={effectiveDisplayPrice}
        bookingType={bookingType}
        images={images}
        bookingError={bookingError}
        selectedCalendarDate={selectedCalendarDate}
        reservedByDate={reservedByDate}
        dayCells={dayCells}
        monthLabel={monthLabel}
        floorRating={floorRating}
        floorComment={floorComment}
        floorReviewsPage={floorReviewsPage}
        floorReviewsMinFilter={floorReviewsMinFilter}
        floorReviewsQuery={floorReviewsQuery.data}
        floorReviewsIsError={floorReviewsQuery.isError}
        canGoNextFloorReviews={(floorReviewsQuery.data?.reviews ?? []).length === floorReviewsLimit}
        onBackToPlace={() => navigate(`/book/place/${roomId}`)}
        onBookingTypeChange={setBookingType}
        onPreviousMonth={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
        onNextMonth={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
        onCalendarDateClick={handleCalendarDateClick}
        onFloorRatingChange={setFloorRating}
        onFloorCommentChange={setFloorComment}
        onSaveRating={() =>
          upsertFloorReviewMutation.mutate({
            rating: floorRating,
            comment: floorComment.trim() || undefined,
          })
        }
        onDeleteRating={() => deleteFloorReviewMutation.mutate()}
        onFloorReviewsPageChange={setFloorReviewsPage}
        onFloorReviewsMinFilterChange={setFloorReviewsMinFilter}
      />

      <FloorAreaDetailsDialog
        area={selectedAreaDetails}
        bookingType={bookingType}
        isLight={isLight}
        onClose={() => setSelectedAreaDetails(null)}
        onSelectArea={(areaName) => {
          setSelectedAreaKeys((current) => (current.includes(areaName) ? current : [...current, areaName]))
          setSelectedAreaDetails(null)
        }}
      />

      <PublicFooter isLight={isLight} />
    </Box>
  )
}
