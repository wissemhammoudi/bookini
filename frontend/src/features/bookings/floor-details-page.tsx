import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Box,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'

import { useColorMode } from '@/app/use-color-mode'
import { PublicFooter } from '@/features/public/components/public-footer'
import { PublicNavbar } from '@/features/public/components/public-navbar'
import { BookingDialog } from './components/BookingDialog'
import { FloorDetailsMainContent } from './components/floor-details-main-content'
import { FloorAreaDetailsDialog } from './components/floor-area-details-dialog'
import {
  FloorDetailsPageLoading,
  FloorDetailsPageNotFound,
} from './components/floor-details-page-states'
import type { BookingFormData } from './types'
import {
  buildCalendarDayCells,
  groupReservedByDate,
  overlaps,
  parseFloorRoomPreviews,
  toIsoDate,
} from './floor-details-utils'
import type { BookingType, FloorRoomPreview } from './floor-details-utils'
import {
  createPublicBookingRequest,
  listPublicBookingCalendarSlots,
  listPublicRooms,
  deleteMyFloorReview,
  listFloorReviews,
  upsertMyFloorReview,
} from '@/lib/api'

export const FloorDetailsPage = () => {
  const navigate = useNavigate()
  const { roomId = '', floorId = '' } = useParams()
  const { mode } = useColorMode()
  const isLight = mode === 'light'

  const [selectedPlan] = useState('pay-as-you-go')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
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
    const imageSeed = encodeURIComponent(room.name.toLowerCase().replace(/\s+/g, '-'))
    const fallback = [
      `https://picsum.photos/seed/${imageSeed}-1/1400/780`,
      `https://picsum.photos/seed/${imageSeed}-2/1200/700`,
      `https://picsum.photos/seed/${imageSeed}-3/1200/700`,
    ]
    const list = [floor?.blueprint_image, room.cover_image, ...(room.gallery ?? [])]
      .filter((item): item is string => typeof item === 'string' && !item.startsWith('['))
      .slice(0, 3)
    return list.length > 0 ? list : fallback;
  }, [room, floor])

  const createBookingMutation = useMutation({ mutationFn: createPublicBookingRequest })
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
    if (!room) return

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
    setBookingDialogOpen(true)
  }

  const handleBookingSubmit = async (
    data: BookingFormData & {
      roomId: number
      floorId?: string
      roomKey?: string
      bookingType?: BookingType
      selectedAreaKeys?: string[]
      roomName: string
      planId: string
      price: number
    },
  ) => {
    setBookingError(null)

    try {
      const latestSlots = await listPublicBookingCalendarSlots({
        room_id: data.roomId,
        start_date: data.bookingDate,
        end_date: data.endDate || data.bookingDate,
      })

      const conflictingSlot = latestSlots.find((slot) =>
        overlaps(data.startTime, data.endTime, slot.start_time, slot.end_time),
      )
      if (conflictingSlot) {
        setBookingError(
          `This time is already reserved (${conflictingSlot.start_time} - ${conflictingSlot.end_time}). Please choose another slot.`,
        )
        return false
      }

      const created = await createBookingMutation.mutateAsync({
        room_id: data.roomId,
        floor_id: data.floorId,
        room_key: data.roomKey,
        booking_type: data.bookingType,
        selected_area_keys: data.selectedAreaKeys,
        room_name: data.roomName,
        plan_id: data.planId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        booking_date: data.bookingDate,
        end_date: data.endDate || undefined,
        start_time: data.startTime,
        end_time: data.endTime,
        participants: Number.parseInt(data.participants, 10) || 1,
        notes: data.notes || undefined,
        price: data.price,
      })

      navigate(`/booking-confirmation/${created.booking_reference}`)
      return true
    } catch {
      setBookingError('Could not complete your booking. Please verify your details and try again.')
      return false
    }
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

      <BookingDialog
        open={bookingDialogOpen}
        room={room}
        selectedFloorId={floor.id}
        bookingType={bookingType}
        selectedAreaKeys={resolvedSelectedAreaKeys}
        areaOptions={areaOptions}
        selectedPlan={selectedPlan}
        isLight={isLight}
        onClose={() => {
          setBookingDialogOpen(false)
          setBookingError(null)
        }}
        onSubmit={handleBookingSubmit}
        isLoading={createBookingMutation.isPending}
        error={bookingError}
        initialBookingDate={selectedCalendarDate}
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
